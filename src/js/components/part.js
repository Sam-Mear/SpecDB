const m = require('mithril');
const specData = require('spec-data');
const pure = require('../pure.js');

module.exports = {
    showAction: false,
    view: vnode => {
        const curData = specData[vnode.attrs.name];
        if(!curData) {
            console.error('No data for part: ' + vnode.attrs.name);
            return m('div');
        }
        console.log(vnode.attrs);
        return m('.part', {
                onclick: curData.isPart ? () => vnode.state.showAction = !vnode.state.showAction : () => vnode.attrs.onCategorySelect(vnode.attrs.name),
            }, [
                m('.part-padding', [
                    m('.part-header', curData.humanName),
                    m('.part-subtext', pure.genSubtext(curData).map(c => m('div', c))),
                ]),
            ]);
    },
}