<?php

namespace SpecDB\MissingParts;
require __DIR__ . '/../vendor/autoload.php';

use SpecDB\MissingParts\Model\PcPartEnum;

class UserBenchmarkMatcher
{
    public string $name {
        get { return $this->name; }
        set { $this->name = $value; }
    }

    public string $formattedName {
        get { return $this->formatName($this->name); }
    }

    public string $specDbName {
        get { return str_replace(' ', '-',$this->name); }
    }

    public string $brand;

    public PcPartEnum $type;

    public bool $found = false;

    public array $foundNames = [];

    private function formatName(string $name): string
    {
        return str_replace(' ', '-', strtolower($name));
    }

    public function matchWithSpecDbName(string $name, PcPartEnum $type): bool
    {
        $formattedName = $this->formatName($name);
        if (str_contains($this->formattedName, $formattedName)) {
            $this->found = true;
            $this->foundNames[] = $name;
            return true;
        }
        if (str_contains($formattedName, $this->formattedName)) {
            $this->found = true;
            $this->foundNames[] = $name;
            return true;
        }
        return false;
    }

    public function placeSpecDbFile(): void
    {
        file_put_contents(__DIR__."/../../specs/MISSINGCPUS/". $this->formattedName .'.yaml', $this->getSpecDbFileContents());
    }

    private function getSpecDbFileContents()
    {
        return sprintf("name: %s
humanName: %s
isPart: true
type: %s
data: 
  Manufacturer: %s
  Core Count: 0
  Thread Count: 0
  Base Frequency: not complete
  TDP: not complete

            ", $this->specDbName, $this->name, $this->type->toString(), $this->brand);
    }
}