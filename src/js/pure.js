// pure easy to test stuff goes here for some reason

module.exports.genSubtext = (data, passedSpecData) => {
	const innerData = data.data;
	
	const genCoreText = d => `${d['Core Count']} Cores, ${d['Thread Count']} Threads`;
	const genClockText = (d, useGpu, prefix = '') => {
		const gpuPrefix = useGpu ? 'GPU ' : '';
		const baseFreq = d[`${gpuPrefix}Base Frequency`];
		const boostFreq = d[`${gpuPrefix}Boost Frequency`];
		const hasBoost = !!boostFreq;
		const textWithoutBoost = `${baseFreq.replace(' ', '')} ${prefix}${hasBoost ? 'Base' : 'Clock'}`;
		return hasBoost ? `${textWithoutBoost}, ${boostFreq.replace(' ', '')} ${prefix}Boost` : textWithoutBoost;
	}
	const genNextGenAPIText = d => {
		const dx12 = parseInt(d['DirectX Support']) >= 12;
		const vulkan = parseInt(d['Vulkan Support']) >= 1;
		return dx12 ?
			vulkan ?
				// dx12 and vulkan
				'Supports DX12 and Vulkan'
			:
				// only dx 12
				'Supports DX12, no Vulkan'
		:
			vulkan ?
				// only vulkan
				'Supports Vulkan, no DX12'
			:
				// neither
				'No DX12 or Vulkan support'
	}
	const genReleaseDate = d => `Released ${d['Release Date']}`;
	const getPartChildCount = d => {
		const specData = passedSpecData || require('spec-data');
		let t = 0;
		const tallyChildren = part => {
			if (!part) {
				return;
			}
			if (part.isPart) {
				t++;
			} else {
				part.sections.forEach(sec =>
					sec.members.forEach(m => tallyChildren(specData[m]))
				);
			}
		}
		tallyChildren(d);
		return `${t} Parts`;
	}
	const getDirectChildCount = d => {
		let t = 0;
		// sometimes, this is just easier than functionally
		d.sections.forEach(c => t += c.members.length );
		return `${t} Subcategories`;
	}

	switch(data.type) {
		case 'Generic Container':
			return [
				getPartChildCount(data),
				getDirectChildCount(data),
			];
		case 'CPU Architecture':
			return [
				innerData.Lithography.replace(' ', '') + ' Lithography',
				genReleaseDate(innerData),
				 innerData.Sockets.join(', ') + ' Socket' + (innerData.Sockets.length > 1 ? 's' : ''),
			];
		case 'Graphics Architecture':
			return [
				innerData.Lithography.replace(' ', '') + ' Lithography',
				genReleaseDate(innerData),
				genNextGenAPIText(innerData),
			];
		case 'APU Architecture':
			return [
				innerData.Lithography.replace(' ', '') + ' Lithography',
				genReleaseDate(innerData),
				genNextGenAPIText(innerData),
			]
		case 'CPU':
			return [
				genCoreText(innerData),
				innerData['Base Frequency'].replace(' ', '') + ' Base, ' + (innerData['Boost Frequency'] || 'No').replace(' ', '') + ' Boost',
				innerData.TDP.replace(' ', '') + ' TDP',
			];
		case 'Graphics Card':
			if (innerData['Shader Processor Count']){
				return [
					innerData['VRAM Capacity'].replace(' ', '') + ' VRAM',
					innerData['Shader Processor Count'] + ' Shader Processors',
					genClockText(innerData, true),
				];
			} else {
				return [
					innerData['VRAM Capacity'].replace(' ', '') + ' VRAM',
					innerData['Pixel Shaders'] + ' Pixel Shaders',
					genClockText(innerData, true),
				];
			}
		case 'APU':
			return [
				genCoreText(innerData),
				genClockText(innerData, false, 'CPU '),
				innerData['Shader Processor Count'] + ' Shader Processors',
			]
		default: return [];
	}
}

module.exports.getTableData = (parts, sections, opts) =>
	// generate all data here, hidden sections will be handled in spec-viewer.js
	// performance overhead is minimal

	sections
	.map(curSection => ({
		name: curSection.name,
		// the rows are already in order
		rows: curSection.rows
			// filter to only those that at least 1 part has
			// also filter out identical rows if that option is enabled
			// using parts.filter for the inner part instead of parts.find for compatibility
			.filter(curRow => parts.filter(curPart => curPart.data[curRow.name]).length
				// showIdenticalRows
				&& (parts.length === 1 || opts.showIdenticalRows || parts.filter(
					(c, _, a) => JSON.stringify(c.data[curRow.name]) !== JSON.stringify(a[0].data[curRow.name])
				).length > 0)
				// showUncomparableRows
				&& (opts.showUncomparableRows || parts.every(p => typeof p.data[curRow.name] !== 'undefined'))
			)
			.map(curRow => {
				curRow.processor = curRow.processor || {};
				// get a list of cells with pre and post processed values
				const fullDataCells = parts.map(curPart => {
					const yamlValue = curPart.data[curRow.name];
					const yamlUndefined = typeof yamlValue === 'undefined';
					const initialUndefined = yamlUndefined && typeof curRow.processor.default === 'undefined';
					const initial = yamlUndefined ? curRow.processor.default : yamlValue;
					return initialUndefined ? {
						postprocessed: '',
					} : {
						preprocessed:
							curRow.processor.preprocess ?
								curRow.processor.preprocess(initial) :
								initial,
						postprocessed:
							curRow.processor.postprocess ?
								curRow.processor.postprocess(initial) :
								initial,
					};
				});
				// find best value/winner/red cell
				const canCompare = !!(
					typeof curRow.processor.compare !== 'undefined' &&
					fullDataCells.filter(fdc => typeof fdc.preprocessed !== 'undefined').length > 1
				);
				const bestPreprocessedJSON = canCompare && JSON.stringify(
					fullDataCells
					.filter(c => typeof c.preprocessed !== 'undefined')
					.map(c => c.preprocessed)
					.reduce((a, b) =>
						curRow.processor.compare(a, b) ? a : b
					)
				);
				// check if all are winners. If this is the case, we don't want any winners
				// some things may not be completely primitive, for ex lists
				const highlightWinners = canCompare &&
					fullDataCells.some(c => JSON.stringify(c.preprocessed) !== bestPreprocessedJSON);
				// now, take the full data cells and the best value to create a slimmed down version
				// containing only the displayed/postprocessed value and whether this cell is a winner
				return {
					name: curRow.name,
					cells: fullDataCells.map((fullCell) => ({
						value: fullCell.postprocessed,
						winner: highlightWinners && JSON.stringify(fullCell.preprocessed) === bestPreprocessedJSON,
					})),
				};
			}),
	}));

module.exports.seo = list => {
	const tr = {};
	const sortedList = list.slice().sort();
	if(JSON.stringify(list) !== JSON.stringify(sortedList)) {
		tr.canonical = `https://specdb.info/${sortedList.join(',')}`;
	}
	switch(list.length) {
		case 0:
			// dash is unicode u2014
			tr.title = 'View and Compare Graphics Cards and CPUs — SpecDB';
			tr.description = 'A modern, fast, and beautiful spec viewing and comparison platform for PC hardware.';
			break;
		case 1:
			tr.title = `${list[0]} Specs and Comparison — SpecDB`;
			tr.description = 'View the specs of the ' + list[0] + ' and compare it to other similar parts on SpecDB.';
			break;
		case 2:
			tr.title = `${list[0]} vs ${list[1]} — SpecDB`;
			tr.description = 'Compare the specs for the ' + list[0] + ' and ' + list[1] + ' side-by-side on SpecDB.';
			break;
		default:
			const humanList = list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
			tr.title = `Compare the ${humanList} — SpecDB`;
			tr.description = `Compare the specs for the ${humanList} side-by-side on SpecDB.`;
	}
	return tr;
}
