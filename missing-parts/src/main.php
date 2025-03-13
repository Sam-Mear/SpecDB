<?php
require __DIR__ . '/../vendor/autoload.php';
// Userbenchmark is only used for list of pc part names
use SpecDB\MissingParts\Model\PcPartEnum;
use SpecDB\MissingParts\UserBenchmarkMatcher;

$contents = json_decode(file_get_contents(__DIR__.'/../../tmp/userbenchmark-parse.json'), true);
$specs = json_decode(file_get_contents(__DIR__.'/../../tmp/specs.json'), true);

$usrBenchmarkList = [];
$missingParts = [];

function placeMetadata(array $names)
{
    $main = "name: MISSINGCPUS
humanName: MISSINGCPUS
type: Generic Container
isPart: false
topHeader: ''
sections:
- header: MISSINGCPUS
  members:
  - MISSINGCPUSAGAIN
";
    file_put_contents(__DIR__.'/../../specs/MISSINGCPUS.yaml', $main);
    $sub = "name: MISSINGCPUSAGAIN
humanName: MISSINGCPUSAGAIN
type: CPU Architecture
topHeader: ''
data:
  Lithography: 30nm
  Sockets:
  - idk lol
  Release Date: '0000-00-00'
sections:
- header: MISSINGCPUS
  members:";
    foreach ($names as $name) {
        $sub = $sub . PHP_EOL . "  - " . $name;
    }

    file_put_contents(__DIR__.'/../../specs/MISSINGCPUS/MISSINGCPUSAGAIN.yaml', $sub);

}
function isBranded($name): bool
{
    $brands = ['(', 'Gigabyte', 'Asus','ASUS', 'HIS', 'MSI', 'PNY', 'Zotac', 'EVGA', 'PowerColor', 'XFX', 'Sapphire', 'Gainward', 'ASRock'];
    foreach ($brands as $brand) {
        if (str_contains($name, $brand)) {
            return true;
        }
    }
    return false;
}

$missingNames = [];
foreach ($contents as $matcher) {
    $bah = new UserBenchmarkMatcher();
    if (isBranded($matcher['combineMetadata']['matcherInfo']['name'])){
        continue;
    }
    $bah->name = $matcher['combineMetadata']['matcherInfo']['name'];
    $bah->brand = $matcher['combineMetadata']['matcherInfo']['brand'];
    $bah->type = PcPartEnum::fromString($matcher['combineMetadata']['matcherInfo']['type']);
    foreach ($specs as $name => $spec) {
        if ($spec['isPart'] == true) {
            if ($bah->matchWithSpecDbName($name, PcPartEnum::fromString($spec['type']))) {
                break;
            }
        }
    }
    if ($bah->found === false) {
        $missingParts[] = $bah;
        printf('%s, %s, %s,%s', $bah->name, $bah->type->toString(), $bah->brand, PHP_EOL);
        $bah->placeSpecDbFile();

        $missingNames[] = $bah->formattedName;

    }
    $bahList[] = $bah;
}
placeMetadata($missingNames);



echo 'FINISHED!!!';
echo json_encode($missingParts);
echo json_encode($missingParts, JSON_PRETTY_PRINT);
