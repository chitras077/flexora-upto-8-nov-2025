"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Calculator, Ruler, Thermometer, Clock, Weight, Zap, ArrowRight, Copy, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversionUnit {
    name: string;
    symbol: string;
    toBase: (value: number) => number;
    fromBase: (value: number) => number;
}

interface ConversionCategory {
    name: string;
    icon: React.ElementType;
    units: ConversionUnit[];
    description: string;
    gradient: string;
    bgGradient: string;
}

const conversionCategories: ConversionCategory[] = [
    {
        name: "Length",
        icon: Ruler,
        description: "Convert between length units",
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-50 to-cyan-50",
        units: [
            { name: "Meter", symbol: "m", toBase: (v) => v, fromBase: (v) => v },
            { name: "Kilometer", symbol: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            { name: "Centimeter", symbol: "cm", toBase: (v) => v * 0.01, fromBase: (v) => v / 0.01 },
            { name: "Millimeter", symbol: "mm", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
            { name: "Mile", symbol: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
            { name: "Yard", symbol: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
            { name: "Foot", symbol: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
            { name: "Inch", symbol: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
        ]
    },
    {
        name: "Weight",
        icon: Weight,
        description: "Convert between weight units",
        gradient: "from-green-500 to-emerald-500",
        bgGradient: "from-green-50 to-emerald-50",
        units: [
            { name: "Kilogram", symbol: "kg", toBase: (v) => v, fromBase: (v) => v },
            { name: "Gram", symbol: "g", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
            { name: "Milligram", symbol: "mg", toBase: (v) => v * 0.000001, fromBase: (v) => v / 0.000001 },
            { name: "Pound", symbol: "lb", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
            { name: "Ounce", symbol: "oz", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
            { name: "Ton", symbol: "t", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        ]
    },
    {
        name: "Temperature",
        icon: Thermometer,
        description: "Convert between temperature scales",
        gradient: "from-red-500 to-orange-500",
        bgGradient: "from-red-50 to-orange-50",
        units: [
            { 
                name: "Celsius", 
                symbol: "°C", 
                toBase: (v) => v + 273.15, 
                fromBase: (v) => v - 273.15 
            },
            { 
                name: "Fahrenheit", 
                symbol: "°F", 
                toBase: (v) => (v - 32) * 5/9 + 273.15, 
                fromBase: (v) => (v - 273.15) * 9/5 + 32 
            },
            { 
                name: "Kelvin", 
                symbol: "K", 
                toBase: (v) => v, 
                fromBase: (v) => v 
            },
        ]
    },
    {
        name: "Time",
        icon: Clock,
        description: "Convert between time units",
        gradient: "from-purple-500 to-pink-500",
        bgGradient: "from-purple-50 to-pink-50",
        units: [
            { name: "Second", symbol: "s", toBase: (v) => v, fromBase: (v) => v },
            { name: "Minute", symbol: "min", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
            { name: "Hour", symbol: "h", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
            { name: "Day", symbol: "d", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
            { name: "Week", symbol: "wk", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
            { name: "Month", symbol: "mo", toBase: (v) => v * 2629746, fromBase: (v) => v / 2629746 },
            { name: "Year", symbol: "yr", toBase: (v) => v * 31556952, fromBase: (v) => v / 31556952 },
        ]
    },
    {
        name: "Data",
        icon: Calculator,
        description: "Convert between data units",
        gradient: "from-indigo-500 to-purple-500",
        bgGradient: "from-indigo-50 to-purple-50",
        units: [
            { name: "Byte", symbol: "B", toBase: (v) => v, fromBase: (v) => v },
            { name: "Kilobyte", symbol: "KB", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
            { name: "Megabyte", symbol: "MB", toBase: (v) => v * 1024 * 1024, fromBase: (v) => v / (1024 * 1024) },
            { name: "Gigabyte", symbol: "GB", toBase: (v) => v * 1024 * 1024 * 1024, fromBase: (v) => v / (1024 * 1024 * 1024) },
            { name: "Terabyte", symbol: "TB", toBase: (v) => v * 1024 * 1024 * 1024 * 1024, fromBase: (v) => v / (1024 * 1024 * 1024 * 1024) },
        ]
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
        },
    },
};

export default function Converters() {
    const { toast } = useToast();
    const [activeCategory, setActiveCategory] = useState<ConversionCategory>(conversionCategories[0]);
    const [fromUnit, setFromUnit] = useState<ConversionUnit>(conversionCategories[0].units[0]);
    const [toUnit, setToUnit] = useState<ConversionUnit>(conversionCategories[0].units[1]);
    const [fromValue, setFromValue] = useState<string>("1");
    const [toValue, setToValue] = useState<string>("");
    const [conversionHistory, setConversionHistory] = useState<Array<{
        from: string;
        to: string;
        result: string;
        timestamp: Date;
    }>>([]);

    useEffect(() => {
        const units = activeCategory.units;
        if (units.length > 0) {
            setFromUnit(units[0]);
            setToUnit(units.length > 1 ? units[1] : units[0]);
        }
    }, [activeCategory]);

    useEffect(() => {
        if (fromValue && fromUnit && toUnit) {
            const value = parseFloat(fromValue);
            if (!isNaN(value)) {
                const baseValue = fromUnit.toBase(value);
                const result = toUnit.fromBase(baseValue);
                setToValue(result.toFixed(6).replace(/\.?0+$/, ""));
            } else {
                setToValue("");
            }
        } else {
            setToValue("");
        }
    }, [fromValue, fromUnit, toUnit]);

    const handleCategoryChange = (categoryName: string) => {
        const category = conversionCategories.find(c => c.name === categoryName);
        if (category) {
            setActiveCategory(category);
        }
    };

    const handleSwapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        setFromValue(toValue);
    };

    const handleConvert = () => {
        if (fromValue && fromUnit && toUnit) {
            const value = parseFloat(fromValue);
            if (!isNaN(value)) {
                const baseValue = fromUnit.toBase(value);
                const result = toUnit.fromBase(baseValue);
                const resultStr = result.toFixed(6).replace(/\.?0+$/, "");
                
                const conversion = {
                    from: `${value} ${fromUnit.symbol}`,
                    to: `${resultStr} ${toUnit.symbol}`,
                    result: `${value} ${fromUnit.name} = ${resultStr} ${toUnit.name}`,
                    timestamp: new Date()
                };
                
                setConversionHistory(prev => [conversion, ...prev.slice(0, 9)]);
                
                toast({
                    title: "Conversion successful! 🎉",
                    description: conversion.result,
                });
            }
        }
    };

    const handleCopyResult = () => {
        if (toValue) {
            navigator.clipboard.writeText(`${toValue} ${toUnit.symbol}`);
            toast({
                title: "Copied to clipboard! 📋",
                description: `${toValue} ${toUnit.symbol}`,
            });
        }
    };

    const clearHistory = () => {
        setConversionHistory([]);
        toast({
            title: "History cleared! 🧹",
        });
    };

    return (
        <motion.div 
            className="min-h-screen py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="container mx-auto px-4">
                {/* Animated Header */}
                <motion.div 
                    className="mb-12 text-center"
                    variants={itemVariants}
                >
                    <motion.h1 
                        className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Universal Converters
                    </motion.h1>
                    <motion.p 
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Convert units, currencies, and measurements instantly with beautiful animations
                    </motion.p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Converter */}
                    <motion.div className="lg:col-span-2" variants={itemVariants}>
                        <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-orange-50">
                            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Calculator className="h-8 w-8" />
                                        </motion.div>
                                        Unit Converter
                                    </CardTitle>
                                </motion.div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Tabs value={activeCategory.name} onValueChange={handleCategoryChange}>
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        <TabsList className="grid w-full grid-cols-5 mb-8 bg-gradient-to-r from-orange-100 to-red-100 p-1">
                                            {conversionCategories.map((category, index) => {
                                                const Icon = category.icon;
                                                return (
                                                    <motion.div
                                                        key={category.name}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <TabsTrigger 
                                                            value={category.name} 
                                                            className={`flex flex-col gap-1 data-[state=active]:bg-gradient-to-r ${category.gradient} data-[state=active]:text-white transition-all duration-300`}
                                                        >
                                                            <motion.div
                                                                initial={{ rotate: 0 }}
                                                                whileHover={{ rotate: 360 }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                <Icon className="h-4 w-4" />
                                                            </motion.div>
                                                            <span className="text-xs font-medium">{category.name}</span>
                                                        </TabsTrigger>
                                                    </motion.div>
                                                );
                                            })}
                                        </TabsList>
                                    </motion.div>

                                    <AnimatePresence mode="wait">
                                        {conversionCategories.map((category) => (
                                            <TabsContent key={category.name} value={category.name} className="space-y-8">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <motion.p 
                                                        className="text-sm text-gray-600 text-center mb-6"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        {category.description}
                                                    </motion.p>
                                                    
                                                    {/* From Unit */}
                                                    <motion.div 
                                                        className="space-y-3"
                                                        initial={{ x: -50, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                                            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                                                            From
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <motion.div
                                                                whileHover={{ scale: 1.02 }}
                                                                transition={{ type: "spring", stiffness: 400 }}
                                                            >
                                                                <Input
                                                                    type="number"
                                                                    value={fromValue}
                                                                    onChange={(e) => setFromValue(e.target.value)}
                                                                    placeholder="Enter value"
                                                                    className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 transition-colors duration-300"
                                                                />
                                                            </motion.div>
                                                            <Select value={fromUnit.name} onValueChange={(value) => {
                                                                const unit = category.units.find(u => u.name === value);
                                                                if (unit) setFromUnit(unit);
                                                            }}>
                                                                <SelectTrigger className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 transition-colors duration-300">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {category.units.map((unit) => (
                                                                        <SelectItem key={unit.name} value={unit.name}>
                                                                            {unit.name} ({unit.symbol})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </motion.div>

                                                    {/* Swap Button */}
                                                    <motion.div 
                                                        className="flex justify-center my-6"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ scale: 1.1, rotate: 180 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            <Button 
                                                                variant="outline" 
                                                                size="lg" 
                                                                onClick={handleSwapUnits}
                                                                className="bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 border-2 border-orange-300 rounded-full p-4"
                                                            >
                                                                <RefreshCw className="h-6 w-6 text-orange-600" />
                                                            </Button>
                                                        </motion.div>
                                                    </motion.div>

                                                    {/* To Unit */}
                                                    <motion.div 
                                                        className="space-y-3"
                                                        initial={{ x: 50, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.4 }}
                                                    >
                                                        <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                                            <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                                                            To
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <motion.div
                                                                whileHover={{ scale: 1.02 }}
                                                                transition={{ type: "spring", stiffness: 400 }}
                                                            >
                                                                <Input
                                                                    type="number"
                                                                    value={toValue}
                                                                    readOnly
                                                                    placeholder="Result"
                                                                    className="text-lg p-4 border-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 font-semibold text-green-700"
                                                                />
                                                            </motion.div>
                                                            <Select value={toUnit.name} onValueChange={(value) => {
                                                                const unit = category.units.find(u => u.name === value);
                                                                if (unit) setToUnit(unit);
                                                            }}>
                                                                <SelectTrigger className="text-lg p-4 border-2 border-gray-200 focus:border-green-500 transition-colors duration-300">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {category.units.map((unit) => (
                                                                        <SelectItem key={unit.name} value={unit.name}>
                                                                            {unit.name} ({unit.symbol})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </motion.div>

                                                    {/* Action Buttons */}
                                                    <motion.div 
                                                        className="flex gap-4 mt-8"
                                                        initial={{ y: 30, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.6 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="flex-1"
                                                        >
                                                            <Button 
                                                                onClick={handleConvert} 
                                                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg shadow-lg transition-all duration-300"
                                                            >
                                                                <Calculator className="h-5 w-5 mr-2" />
                                                                Convert
                                                                <Zap className="h-5 w-5 ml-2" />
                                                            </Button>
                                                        </motion.div>
                                                        <motion.div
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Button 
                                                                variant="outline" 
                                                                onClick={handleCopyResult} 
                                                                disabled={!toValue}
                                                                className="bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 border-2 border-blue-300 px-6"
                                                            >
                                                                <Copy className="h-5 w-5" />
                                                            </Button>
                                                        </motion.div>
                                                    </motion.div>

                                                    {/* Quick Reference */}
                                                    <motion.div 
                                                        className={`p-6 rounded-xl bg-gradient-to-r ${category.bgGradient} border-2 border-gray-200`}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.7 }}
                                                    >
                                                        <h4 className="font-bold text-lg mb-4 text-gray-700">Quick Reference</h4>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            {category.units.slice(0, 4).map((unit, index) => (
                                                                <motion.div 
                                                                    key={unit.name} 
                                                                    className="flex justify-between p-3 bg-white rounded-lg shadow-sm"
                                                                    initial={{ x: -20, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.8 + index * 0.1 }}
                                                                >
                                                                    <span className="font-medium text-gray-700">{unit.name}:</span>
                                                                    <span className="font-mono font-bold text-gray-900">{unit.symbol}</span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            </TabsContent>
                                        ))}
                                    </AnimatePresence>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Conversion History */}
                    <motion.div className="lg:col-span-1 space-y-6" variants={itemVariants}>
                        <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <History className="h-6 w-6" />
                                            Conversion History
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={clearHistory}
                                                className="text-white hover:bg-white/20"
                                            >
                                                Clear
                                            </Button>
                                        </motion.div>
                                    </CardTitle>
                                </motion.div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <AnimatePresence>
                                    {conversionHistory.length === 0 ? (
                                        <motion.div 
                                            className="text-center py-12 text-gray-500"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                            </motion.div>
                                            <p className="text-lg font-medium">No conversions yet</p>
                                            <p className="text-sm mt-2">Start converting to see history!</p>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {conversionHistory.map((conversion, index) => (
                                                <motion.div 
                                                    key={index} 
                                                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                                                    initial={{ x: 50, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: -50, opacity: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <div className="text-sm font-semibold text-gray-800 mb-1">
                                                        {conversion.result}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {conversion.timestamp.toLocaleTimeString()}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>

                        {/* Common Conversions */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50">
                                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-6 w-6" />
                                        Common Conversions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {[
                                            { from: "1 inch", to: "2.54 cm" },
                                            { from: "1 pound", to: "0.454 kg" },
                                            { from: "1 mile", to: "1.609 km" },
                                            { from: "0°C", to: "32°F" },
                                            { from: "1 GB", to: "1024 MB" },
                                        ].map((conversion, index) => (
                                            <motion.div 
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                                                initial={{ x: -30, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.9 + index * 0.1 }}
                                                whileHover={{ scale: 1.02, x: 5 }}
                                            >
                                                <span className="font-medium text-gray-700">{conversion.from}</span>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                                <span className="font-mono font-bold text-gray-900">{conversion.to}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}