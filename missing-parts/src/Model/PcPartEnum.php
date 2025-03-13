<?php

namespace SpecDB\MissingParts\Model;
require __DIR__ . '/../../vendor/autoload.php';

enum PcPartEnum
{
    case GPU;
    case CPU;

    case UNKOWN;

    public static function fromString(string $name): ?PCPartEnum
    {
        return match ($name) {
            'CPU' => PcPartEnum::CPU,
            'GPU' => PcPartEnum::GPU,
            'Graphics Card' => PcPartEnum::GPU,
            default => PcPartEnum::UNKOWN,
        };
    }

    public function toString(): string
    {
        return match ($this) {
            PcPartEnum::GPU => 'Graphics Card',
            PcPartEnum::CPU => 'CPU',
            PcPartEnum::UNKOWN => 'UNKOWN',
        };
    }
}