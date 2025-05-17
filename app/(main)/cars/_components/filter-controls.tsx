"use client";

import { Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface CurrentFilters {
  make: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  priceRange: [number, number];
}

interface CarFilterControlsProps {
  filters: {
    makes: string[];
    bodyTypes: string[];
    fuelTypes: string[];
    transmissions: string[];
    priceRange: { min: number; max: number };
  };
  currentFilters: CurrentFilters;
  onFilterChange: (
    filterType: keyof CurrentFilters,
    value: string | [number, number]
  ) => void;
  onClearFilter: (filterType: keyof CurrentFilters) => void;
}

export const CarFilterControls = ({
  filters,
  currentFilters,
  onFilterChange,
  onClearFilter,
}: CarFilterControlsProps) => {
  const { make, bodyType, fuelType, transmission, priceRange } = currentFilters;

  interface FilterOption {
    value: string;
    label: string;
  }

  interface FilterSection {
    id: keyof CurrentFilters;
    title: string;
    options: FilterOption[];
    currentValue: string | [number, number];
    onChange: (value: string | [number, number]) => void;
  }

  const filterSections: FilterSection[] = [
    {
      id: "make",
      title: "Make",
      options: filters.makes.map((make) => ({ value: make, label: make })),
      currentValue: make,
      onChange: (value) => onFilterChange("make", value),
    },
    {
      id: "bodyType",
      title: "Body Type",
      options: filters.bodyTypes.map((type) => ({ value: type, label: type })),
      currentValue: bodyType,
      onChange: (value) => onFilterChange("bodyType", value),
    },
    {
      id: "fuelType",
      title: "Fuel Type",
      options: filters.fuelTypes.map((type) => ({ value: type, label: type })),
      currentValue: fuelType,
      onChange: (value) => onFilterChange("fuelType", value),
    },
    {
      id: "transmission",
      title: "Transmission",
      options: filters.transmissions.map((type) => ({
        value: type,
        label: type,
      })),
      currentValue: transmission,
      onChange: (value) => onFilterChange("transmission", value),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-medium">Price Range</h3>
        <div className="px-2">
          <Slider
            min={filters.priceRange.min}
            max={filters.priceRange.max}
            step={100}
            className="cursor-pointer"
            value={priceRange}
            onValueChange={(value) => {
              if (value.length === 2) {
                onFilterChange("priceRange", [value[0], value[1]] as [
                  number,
                  number
                ]);
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between ">
          <div className="font-medium text-sm ">$ {priceRange[0]}</div>
          <div className="font-medium text-sm">$ {priceRange[1]}</div>
        </div>
      </div>

      {/* Filter Categories */}
      {filterSections.map((section) => (
        <div key={section.id} className="space-y-3">
          <h4 className="text-sm font-medium flex justify-between">
            <span>{section.title}</span>
            {section.currentValue && (
              <button
                className="text-xs text-gray-600 flex items-center cursor-pointer"
                onClick={() => onClearFilter(section.id)}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </button>
            )}
          </h4>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {section.options.map((option) => (
              <Badge
                key={option.value}
                variant={
                  section.currentValue === option.value ? "default" : "outline"
                }
                className={`cursor-pointer px-3 py-1 ${
                  section.currentValue === option.value
                    ? "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-200"
                    : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  section.onChange(
                    section.currentValue === option.value ? "" : option.value
                  );
                }}
              >
                {option.label}
                {section.currentValue === option.value && (
                  <Check className="ml-1 h-3 w-3 inline" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
