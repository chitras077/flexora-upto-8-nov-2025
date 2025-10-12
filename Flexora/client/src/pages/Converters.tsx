import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";

type ConversionCategory = 
  | "length" | "weight" | "temperature" | "area" | "volume" 
  | "speed" | "time" | "pressure" | "energy" | "frequency" 
  | "fuel_economy" | "data_transfer" | "digital_storage" | "plane_angle" | "power";

interface ConversionData {
  [key: string]: {
    name: string;
    units: { [key: string]: { name: string; toBase: number | ((v: number) => number); fromBase: number | ((v: number) => number) } };
    baseUnit: string;
  };
}

const conversionData: ConversionData = {
  length: {
    name: "Length",
    baseUnit: "meter",
    units: {
      meter: { name: "Meter", toBase: 1, fromBase: 1 },
      kilometer: { name: "Kilometer", toBase: 1000, fromBase: 0.001 },
      centimeter: { name: "Centimeter", toBase: 0.01, fromBase: 100 },
      millimeter: { name: "Millimeter", toBase: 0.001, fromBase: 1000 },
      mile: { name: "Mile", toBase: 1609.34, fromBase: 0.000621371 },
      yard: { name: "Yard", toBase: 0.9144, fromBase: 1.09361 },
      foot: { name: "Foot", toBase: 0.3048, fromBase: 3.28084 },
      inch: { name: "Inch", toBase: 0.0254, fromBase: 39.3701 },
    },
  },
  weight: {
    name: "Mass/Weight",
    baseUnit: "kilogram",
    units: {
      kilogram: { name: "Kilogram", toBase: 1, fromBase: 1 },
      gram: { name: "Gram", toBase: 0.001, fromBase: 1000 },
      milligram: { name: "Milligram", toBase: 0.000001, fromBase: 1000000 },
      pound: { name: "Pound", toBase: 0.453592, fromBase: 2.20462 },
      ounce: { name: "Ounce", toBase: 0.0283495, fromBase: 35.274 },
      ton: { name: "Metric Ton", toBase: 1000, fromBase: 0.001 },
    },
  },
  temperature: {
    name: "Temperature",
    baseUnit: "celsius",
    units: {
      celsius: { 
        name: "Celsius", 
        toBase: (v: number) => v, 
        fromBase: (v: number) => v 
      },
      fahrenheit: { 
        name: "Fahrenheit", 
        toBase: (v: number) => (v - 32) * 5/9, 
        fromBase: (v: number) => (v * 9/5) + 32 
      },
      kelvin: { 
        name: "Kelvin", 
        toBase: (v: number) => v - 273.15, 
        fromBase: (v: number) => v + 273.15 
      },
    },
  },
  area: {
    name: "Area",
    baseUnit: "square_meter",
    units: {
      square_meter: { name: "Square Meter", toBase: 1, fromBase: 1 },
      square_kilometer: { name: "Square Kilometer", toBase: 1000000, fromBase: 0.000001 },
      square_centimeter: { name: "Square Centimeter", toBase: 0.0001, fromBase: 10000 },
      square_mile: { name: "Square Mile", toBase: 2589988.11, fromBase: 3.861e-7 },
      square_yard: { name: "Square Yard", toBase: 0.836127, fromBase: 1.19599 },
      square_foot: { name: "Square Foot", toBase: 0.092903, fromBase: 10.7639 },
      acre: { name: "Acre", toBase: 4046.86, fromBase: 0.000247105 },
      hectare: { name: "Hectare", toBase: 10000, fromBase: 0.0001 },
    },
  },
  volume: {
    name: "Volume",
    baseUnit: "liter",
    units: {
      liter: { name: "Liter", toBase: 1, fromBase: 1 },
      milliliter: { name: "Milliliter", toBase: 0.001, fromBase: 1000 },
      cubic_meter: { name: "Cubic Meter", toBase: 1000, fromBase: 0.001 },
      cubic_centimeter: { name: "Cubic Centimeter", toBase: 0.001, fromBase: 1000 },
      gallon: { name: "Gallon (US)", toBase: 3.78541, fromBase: 0.264172 },
      quart: { name: "Quart (US)", toBase: 0.946353, fromBase: 1.05669 },
      pint: { name: "Pint (US)", toBase: 0.473176, fromBase: 2.11338 },
      cup: { name: "Cup (US)", toBase: 0.236588, fromBase: 4.22675 },
    },
  },
  speed: {
    name: "Speed",
    baseUnit: "meter_per_second",
    units: {
      meter_per_second: { name: "Meter/Second", toBase: 1, fromBase: 1 },
      kilometer_per_hour: { name: "Kilometer/Hour", toBase: 0.277778, fromBase: 3.6 },
      mile_per_hour: { name: "Mile/Hour", toBase: 0.44704, fromBase: 2.23694 },
      knot: { name: "Knot", toBase: 0.514444, fromBase: 1.94384 },
      foot_per_second: { name: "Foot/Second", toBase: 0.3048, fromBase: 3.28084 },
    },
  },
  time: {
    name: "Time",
    baseUnit: "second",
    units: {
      second: { name: "Second", toBase: 1, fromBase: 1 },
      minute: { name: "Minute", toBase: 60, fromBase: 1/60 },
      hour: { name: "Hour", toBase: 3600, fromBase: 1/3600 },
      day: { name: "Day", toBase: 86400, fromBase: 1/86400 },
      week: { name: "Week", toBase: 604800, fromBase: 1/604800 },
      month: { name: "Month (30 days)", toBase: 2592000, fromBase: 1/2592000 },
      year: { name: "Year (365 days)", toBase: 31536000, fromBase: 1/31536000 },
    },
  },
  pressure: {
    name: "Pressure",
    baseUnit: "pascal",
    units: {
      pascal: { name: "Pascal", toBase: 1, fromBase: 1 },
      kilopascal: { name: "Kilopascal", toBase: 1000, fromBase: 0.001 },
      bar: { name: "Bar", toBase: 100000, fromBase: 0.00001 },
      psi: { name: "PSI", toBase: 6894.76, fromBase: 0.000145038 },
      atmosphere: { name: "Atmosphere", toBase: 101325, fromBase: 9.8692e-6 },
      torr: { name: "Torr", toBase: 133.322, fromBase: 0.00750062 },
    },
  },
  energy: {
    name: "Energy",
    baseUnit: "joule",
    units: {
      joule: { name: "Joule", toBase: 1, fromBase: 1 },
      kilojoule: { name: "Kilojoule", toBase: 1000, fromBase: 0.001 },
      calorie: { name: "Calorie", toBase: 4.184, fromBase: 0.239006 },
      kilocalorie: { name: "Kilocalorie", toBase: 4184, fromBase: 0.000239006 },
      watt_hour: { name: "Watt-hour", toBase: 3600, fromBase: 0.000277778 },
      kilowatt_hour: { name: "Kilowatt-hour", toBase: 3600000, fromBase: 2.7778e-7 },
    },
  },
  frequency: {
    name: "Frequency",
    baseUnit: "hertz",
    units: {
      hertz: { name: "Hertz", toBase: 1, fromBase: 1 },
      kilohertz: { name: "Kilohertz", toBase: 1000, fromBase: 0.001 },
      megahertz: { name: "Megahertz", toBase: 1000000, fromBase: 0.000001 },
      gigahertz: { name: "Gigahertz", toBase: 1000000000, fromBase: 1e-9 },
    },
  },
  fuel_economy: {
    name: "Fuel Economy",
    baseUnit: "liter_per_100km",
    units: {
      liter_per_100km: { name: "L/100km", toBase: 1, fromBase: 1 },
      miles_per_gallon_us: { name: "MPG (US)", toBase: (v: number) => 235.215 / v, fromBase: (v: number) => 235.215 / v },
      miles_per_gallon_uk: { name: "MPG (UK)", toBase: (v: number) => 282.481 / v, fromBase: (v: number) => 282.481 / v },
      kilometer_per_liter: { name: "km/L", toBase: (v: number) => 100 / v, fromBase: (v: number) => 100 / v },
    },
  },
  data_transfer: {
    name: "Data Transfer Rate",
    baseUnit: "bit_per_second",
    units: {
      bit_per_second: { name: "bit/s", toBase: 1, fromBase: 1 },
      kilobit_per_second: { name: "Kbit/s", toBase: 1000, fromBase: 0.001 },
      megabit_per_second: { name: "Mbit/s", toBase: 1000000, fromBase: 0.000001 },
      gigabit_per_second: { name: "Gbit/s", toBase: 1000000000, fromBase: 1e-9 },
      byte_per_second: { name: "B/s", toBase: 8, fromBase: 0.125 },
      kilobyte_per_second: { name: "KB/s", toBase: 8000, fromBase: 0.000125 },
      megabyte_per_second: { name: "MB/s", toBase: 8000000, fromBase: 1.25e-7 },
    },
  },
  digital_storage: {
    name: "Digital Storage",
    baseUnit: "byte",
    units: {
      byte: { name: "Byte", toBase: 1, fromBase: 1 },
      kilobyte: { name: "Kilobyte (KB)", toBase: 1024, fromBase: 1/1024 },
      megabyte: { name: "Megabyte (MB)", toBase: 1048576, fromBase: 1/1048576 },
      gigabyte: { name: "Gigabyte (GB)", toBase: 1073741824, fromBase: 1/1073741824 },
      terabyte: { name: "Terabyte (TB)", toBase: 1099511627776, fromBase: 1/1099511627776 },
      bit: { name: "Bit", toBase: 0.125, fromBase: 8 },
      kilobit: { name: "Kilobit (Kb)", toBase: 128, fromBase: 1/128 },
      megabit: { name: "Megabit (Mb)", toBase: 131072, fromBase: 1/131072 },
    },
  },
  plane_angle: {
    name: "Plane Angle",
    baseUnit: "degree",
    units: {
      degree: { name: "Degree", toBase: 1, fromBase: 1 },
      radian: { name: "Radian", toBase: 57.2958, fromBase: 0.0174533 },
      gradian: { name: "Gradian", toBase: 0.9, fromBase: 1.11111 },
      turn: { name: "Turn", toBase: 360, fromBase: 1/360 },
    },
  },
  power: {
    name: "Power",
    baseUnit: "watt",
    units: {
      watt: { name: "Watt", toBase: 1, fromBase: 1 },
      kilowatt: { name: "Kilowatt", toBase: 1000, fromBase: 0.001 },
      megawatt: { name: "Megawatt", toBase: 1000000, fromBase: 0.000001 },
      horsepower: { name: "Horsepower", toBase: 745.7, fromBase: 0.00134102 },
      btu_per_hour: { name: "BTU/hour", toBase: 0.293071, fromBase: 3.41214 },
    },
  },
};

export default function Converters() {
  const [category, setCategory] = useState<ConversionCategory>("length");
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("centimeter");
  const [formula, setFormula] = useState("");

  const handleCategoryChange = (newCategory: ConversionCategory) => {
    setCategory(newCategory);
    const firstUnit = Object.keys(conversionData[newCategory].units)[0];
    const secondUnit = Object.keys(conversionData[newCategory].units)[1] || firstUnit;
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
    setFromValue("1");
    setToValue("");
  };
  
  // Quick access to common conversions
  const quickConverters = [
    { name: "Length", category: "length" },
    { name: "Weight", category: "weight" },
    { name: "Temperature", category: "temperature" },
    { name: "Area", category: "area" },
    { name: "Volume", category: "volume" },
    { name: "Speed", category: "speed" }
  ];

  useEffect(() => {
    if (!fromValue || fromValue === "") {
      setToValue("");
      setFormula("");
      return;
    }

    const inputValue = parseFloat(fromValue);
    if (isNaN(inputValue)) {
      setToValue("");
      setFormula("");
      return;
    }

    const categoryData = conversionData[category];
    const fromUnitData = categoryData.units[fromUnit];
    const toUnitData = categoryData.units[toUnit];

    let result: number;
    
    if (typeof fromUnitData.toBase === 'function' && typeof toUnitData.fromBase === 'function') {
      const baseValue = fromUnitData.toBase(inputValue);
      result = toUnitData.fromBase(baseValue);
    } else if (typeof fromUnitData.toBase === 'number' && typeof toUnitData.fromBase === 'number') {
      const baseValue = inputValue * fromUnitData.toBase;
      result = baseValue * toUnitData.fromBase;
    } else {
      result = 0;
    }

    setToValue(result.toFixed(8).replace(/\.?0+$/, ''));

    // Generate formula
    if (typeof fromUnitData.toBase === 'number' && typeof toUnitData.fromBase === 'number') {
      const conversionFactor = fromUnitData.toBase * toUnitData.fromBase;
      if (conversionFactor === 1) {
        setFormula(`1 ${fromUnitData.name} = 1 ${toUnitData.name}`);
      } else if (conversionFactor > 1) {
        setFormula(`Multiply the ${categoryData.name.toLowerCase()} value by ${conversionFactor.toFixed(8).replace(/\.?0+$/, '')}`);
      } else {
        setFormula(`Divide the ${categoryData.name.toLowerCase()} value by ${(1/conversionFactor).toFixed(8).replace(/\.?0+$/, '')}`);
      }
    } else {
      setFormula(`Convert ${fromUnitData.name} to ${toUnitData.name}`);
    }
  }, [fromValue, fromUnit, toUnit, category]);

  const currentUnits = Object.entries(conversionData[category].units);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Universal Converter Suite</h1>
          <p className="text-xl text-muted-foreground">
            Convert units, currencies, and more with ease
          </p>
        </div>

        {/* Quick Converter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 max-w-4xl mx-auto">
          {quickConverters.map((converter) => (
            <button
              key={converter.category}
              onClick={() => handleCategoryChange(converter.category as ConversionCategory)}
              className={`p-3 rounded-lg text-center transition-colors ${
                category === converter.category 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-primary/10"
              }`}
            >
              {converter.name}
            </button>
          ))}
        </div>

        <Card className="shadow-medium max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Universal Converter</CardTitle>
            <CardDescription>Select a category and convert between different units</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">What would you like to convert?</label>
              <Select value={category} onValueChange={(value) => handleCategoryChange(value as ConversionCategory)}>
                <SelectTrigger className="w-full" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="length">Length</SelectItem>
                  <SelectItem value="weight">Mass/Weight</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="pressure">Pressure</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="frequency">Frequency</SelectItem>
                  <SelectItem value="fuel_economy">Fuel Economy</SelectItem>
                  <SelectItem value="data_transfer">Data Transfer Rate</SelectItem>
                  <SelectItem value="digital_storage">Digital Storage</SelectItem>
                  <SelectItem value="plane_angle">Plane Angle</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conversion Boxes */}
            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
              {/* From Box */}
              <div className="border-2 border-primary/20 rounded-lg p-6">
                <div className="flex flex-col space-y-2">
                  <Input
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    placeholder="Enter value"
                    className="text-2xl font-semibold h-14 text-center"
                    data-testid="input-from-value"
                  />
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger className="w-full" data-testid="select-from-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUnits.map(([key, unit]) => (
                        <SelectItem key={key} value={key}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Equals Sign */}
              <div className="flex items-center justify-center">
                <div className="text-2xl font-bold">=</div>
              </div>

              {/* To Box */}
              <div className="border-2 border-primary/20 rounded-lg p-6">
                <div className="flex flex-col space-y-2">
                  <Input
                    type="text"
                    value={toValue}
                    readOnly
                    placeholder="Result"
                    className="text-2xl font-semibold h-14 text-center bg-muted/30"
                    data-testid="input-to-value"
                  />
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger className="w-full" data-testid="select-to-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUnits.map(([key, unit]) => (
                        <SelectItem key={key} value={key}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Formula Display */}
            {formula && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <p className="text-sm font-medium text-center" data-testid="text-formula">
                  <span className="text-primary">Formula:</span> {formula}
                </p>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Simply enter a value in the "From" box and select your units. The conversion happens automatically in real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
