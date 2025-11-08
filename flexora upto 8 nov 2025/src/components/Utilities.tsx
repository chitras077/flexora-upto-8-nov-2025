/* eslint-disable */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Type,
    Hash,
    Key,
    Calculator,
    Copy,
    Download,
    Eye,
    EyeOff,
    RefreshCw,
    Code,
    Palette,
    Clock,
    Globe,
    Shield,
    Zap,
    FileText,
    Scissors,
    Link,
    Image,
    BarChart,
    CheckCircle,
    XCircle,
    AlertCircle,
    Lock,
    Unlock,
    Binary,
    Hexagon,
    Calendar,
    Timer,
    TrendingUp,
    ArrowRight,
    Upload,
    Search,
    Replace,
    SortAsc,
    Filter,
    RotateCw,
    Wifi,
    Cpu,
    Database,
    Server,
    Terminal,
    GitBranch,
    FileJson,
    FileCode,
    FileSpreadsheet,
    FileArchive,
    Bold,
    Italic,
    Underline,
    List,
    Quote,
    Heading1,
    Divide,
    Equal,
    Infinity,
    Target,
    Compass,
    Grid3X3,
    Ruler,
    Thermometer,
    Gauge,
    Activity,
    ThumbsUp,
    Smile,
    Battery,
    Signal,
    Volume,
    Play,
    Pause,
    Trash,
    X,
    Save,
    Archive,
    Cloud,
    Settings,
    Monitor,
    Smartphone,
    Camera,
    Mic,
    Speaker,
    Headphones,
    Keyboard,
    MousePointer,
    Touchpad,
    Tablet,
    Watch,
    Maximize,
    Minimize,
    Expand,
    Shrink,
    Move,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading2,
    Heading3,
    Square,
    Box,
    Power,
    Crosshair,
    Repeat,
    Shuffle,
    Enter,
    Delete,
    Edit,
    LogOut,
    FolderOpen,
    SaveAll,
    DownloadCloud,
    UploadCloud,
    CloudOff,
    ThumbsDown,
    Frown,
    Meh,
    ZapOff,
    TimerOff,
    TimerReset,
    Hourglass,
} from "lucide-react";
import { marked } from "marked";

// Tool categories with icons and colors
const toolCategories = [
    {
        name: "Text Tools",
        icon: Type,
        color: "from-blue-500 to-cyan-500",
        bgColor: "from-blue-50 to-cyan-50",
        tools: [
            { name: "Case Converter", icon: Type, action: "caseConverter" },
            { name: "Find & Replace", icon: Search, action: "findReplace" },
            { name: "Text Extractor", icon: Filter, action: "textExtractor" },
            { name: "Sort Lines", icon: SortAsc, action: "sortLines" },
            { name: "Remove Duplicates", icon: RefreshCw, action: "removeDuplicates" },
            { name: "Add Line Numbers", icon: List, action: "addLineNumbers" },
            { name: "Word Counter", icon: FileText, action: "wordCounter" },
            { name: "Character Counter", icon: Type, action: "characterCounter" },
            { name: "Text Diff", icon: GitBranch, action: "textDiff" },
            { name: "Reverse Text", icon: RefreshCw, action: "reverseText" },
            { name: "Text to Speech", icon: Mic, action: "textToSpeech" },
            { name: "Lorem Ipsum", icon: FileText, action: "loremIpsum" },
        ]
    },
    {
        name: "Data Converters",
        icon: Database,
        color: "from-green-500 to-emerald-500",
        bgColor: "from-green-50 to-emerald-50",
        tools: [
            { name: "JSON Formatter", icon: FileJson, action: "jsonFormatter" },
            { name: "URL Encoder", icon: Link, action: "urlEncoder" },
            { name: "Base64 Encode", icon: Shield, action: "base64Encoder" },
            { name: "HTML Escape", icon: Code, action: "htmlEscape" },
            { name: "CSV to JSON", icon: FileSpreadsheet, action: "csvToJson" },
            { name: "XML to JSON", icon: FileCode, action: "xmlToJson" },
            { name: "YAML to JSON", icon: FileJson, action: "yamlToJson" },
            { name: "SQL Formatter", icon: Database, action: "sqlFormatter" },
            { name: "Markdown to HTML", icon: FileText, action: "markdownToHtml" },
            { name: "Number to Words", icon: Hash, action: "numberToWords" },
            { name: "Morse Code", icon: Zap, action: "morseCode" },
            { name: "Braille Translator", icon: Eye, action: "brailleTranslator" },
        ]
    },
    {
        name: "Security Tools",
        icon: Lock,
        color: "from-red-500 to-orange-500",
        bgColor: "from-red-50 to-orange-50",
        tools: [
            { name: "Password Generator", icon: Key, action: "passwordGenerator" },
            { name: "Hash Generator", icon: Shield, action: "hashGenerator" },
            { name: "UUID Generator", icon: Hash, action: "uuidGenerator" },
            { name: "JWT Decoder", icon: Unlock, action: "jwtDecoder" },
            { name: "QR Code Generator", icon: Grid3X3, action: "qrGenerator" },
            { name: "Password Strength", icon: Gauge, action: "passwordStrength" },
            { name: "API Key Generator", icon: Key, action: "apiKeyGenerator" },
            { name: "Salt Generator", icon: Shuffle, action: "saltGenerator" },
            { name: "Checksum", icon: CheckCircle, action: "checksum" },
            { name: "HMAC Generator", icon: Shield, action: "hmacGenerator" },
            { name: "Token Validator", icon: CheckCircle, action: "tokenValidator" },
            { name: "Encryption Tool", icon: Lock, action: "encryptionTool" },
        ]
    },
    {
        name: "Color Tools",
        icon: Palette,
        color: "from-purple-500 to-pink-500",
        bgColor: "from-purple-50 to-pink-50",
        tools: [
            { name: "Color Picker", icon: Palette, action: "colorPicker" },
            { name: "Color Converter", icon: RefreshCw, action: "colorConverter" },
            { name: "Color Palette", icon: Image, action: "colorPalette" },
            { name: "Gradient Generator", icon: BarChart, action: "gradientGenerator" },
            { name: "Color Blindness", icon: Eye, action: "colorBlindness" },
            { name: "Color Contrast", icon: EyeOff, action: "colorContrast" },
            { name: "Color Mixer", icon: Palette, action: "colorMixer" },
            { name: "Color Scheme", icon: Palette, action: "colorScheme" },
            { name: "Color Extractor", icon: Eye, action: "colorExtractor" },
            { name: "Color Wheel", icon: RefreshCw, action: "colorWheel" },
            { name: "Tint & Shade", icon: Eye, action: "tintShade" },
            { name: "Color Names", icon: Type, action: "colorNames" },
        ]
    },
    {
        name: "Math Tools",
        icon: Calculator,
        color: "from-indigo-500 to-purple-500",
        bgColor: "from-indigo-50 to-purple-50",
        tools: [
            { name: "Calculator", icon: Calculator, action: "calculator" },
            { name: "Binary Converter", icon: Binary, action: "binaryConverter" },
            { name: "Hex Converter", icon: Hexagon, action: "hexConverter" },
            { name: "Percentage Calc", icon: Target, action: "percentageCalc" },
            { name: "Random Number", icon: Shuffle, action: "randomNumber" },
            { name: "Roman Numerals", icon: Hash, action: "romanNumerals" },
            { name: "Octal Converter", icon: Binary, action: "octalConverter" },
            { name: "Scientific Calc", icon: Calculator, action: "scientificCalc" },
            { name: "GCD/LCM", icon: Hash, action: "gcdLcm" },
            { name: "Prime Numbers", icon: Hash, action: "primeNumbers" },
            { name: "Factorial", icon: Calculator, action: "factorial" },
            { name: "Statistics", icon: BarChart, action: "statistics" },
        ]
    },
    {
        name: "Time & Date",
        icon: Clock,
        color: "from-yellow-500 to-orange-500",
        bgColor: "from-yellow-50 to-orange-50",
        tools: [
            { name: "Timestamp Converter", icon: Timer, action: "timestampConverter" },
            { name: "Date Calculator", icon: Calendar, action: "dateCalculator" },
            { name: "Time Zone Converter", icon: Globe, action: "timezoneConverter" },
            { name: "Age Calculator", icon: Calendar, action: "ageCalculator" },
            { name: "Countdown Timer", icon: Clock, action: "countdownTimer" },
            { name: "Unix Timestamp", icon: Terminal, action: "unixTimestamp" },
            { name: "Date Difference", icon: Calendar, action: "dateDifference" },
            { name: "Time Calculator", icon: Clock, action: "timeCalculator" },
            { name: "World Clock", icon: Globe, action: "worldClock" },
            { name: "Stopwatch", icon: Timer, action: "stopwatch" },
            { name: "Alarm Clock", icon: Clock, action: "alarmClock" },
            { name: "Easter Calculator", icon: Calendar, action: "easterCalculator" },
        ]
    },
    {
        name: "Network Tools",
        icon: Wifi,
        color: "from-cyan-500 to-blue-500",
        bgColor: "from-cyan-50 to-blue-50",
        tools: [
            { name: "IP Lookup", icon: Globe, action: "ipLookup" },
            { name: "DNS Lookup", icon: Server, action: "dnsLookup" },
            { name: "Port Scanner", icon: Shield, action: "portScanner" },
            { name: "Ping Test", icon: Activity, action: "pingTest" },
            { name: "Speed Test", icon: Activity, action: "speedTest" },
            { name: "WHOIS Lookup", icon: Search, action: "whoisLookup" },
            { name: "Traceroute", icon: ArrowRight, action: "traceroute" },
            { name: "SSL Checker", icon: Shield, action: "sslChecker" },
            { name: "HTTP Headers", icon: Server, action: "httpHeaders" },
            { name: "URL Shortener", icon: Link, action: "urlShortener" },
            { name: "Domain Info", icon: Globe, action: "domainInfo" },
            { name: "Network Calc", icon: Calculator, action: "networkCalc" },
        ]
    },
    {
        name: "Developer Tools",
        icon: Code,
        color: "from-gray-500 to-gray-600",
        bgColor: "from-gray-50 to-gray-100",
        tools: [
            { name: "Regex Tester", icon: Search, action: "regexTester" },
            { name: "Code Formatter", icon: FileCode, action: "codeFormatter" },
            { name: "Markdown Preview", icon: FileText, action: "markdownPreview" },
            { name: "Git Commit", icon: GitBranch, action: "gitCommit" },
            { name: "Cron Generator", icon: Clock, action: "cronGenerator" },
            { name: "SQL Formatter", icon: Database, action: "sqlFormatter" },
            { name: "JSON Validator", icon: FileJson, action: "jsonValidator" },
            { name: "HTML Minifier", icon: Code, action: "htmlMinifier" },
            { name: "CSS Minifier", icon: Palette, action: "cssMinifier" },
            { name: "JS Obfuscator", icon: Shield, action: "jsObfuscator" },
            { name: "Base32 Converter", icon: Binary, action: "base32Converter" },
            { name: "URL Parser", icon: Link, action: "urlParser" },
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

export default function Utilities() {
    const { toast } = useToast();
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const activeToolRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [wheelPosition, setWheelPosition] = useState({ x: 160, y: 160 }); // Center of wheel
    const [selectedHsl, setSelectedHsl] = useState({ h: 0, s: 50, l: 50 });
    const [complementaryHsl, setComplementaryHsl] = useState({ h: 180, s: 50, l: 50 });
    const [textInput, setTextInput] = useState("");
    const [textOutput, setTextOutput] = useState("");
    const [findText, setFindText] = useState("");
    const [replaceText, setReplaceText] = useState("");
    const [caseType, setCaseType] = useState("uppercase");
    const [passwordLength, setPasswordLength] = useState(16);
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [hashInput, setHashInput] = useState("");
    const [hashOutput, setHashOutput] = useState({ md5: "", sha1: "", sha256: "", sha512: "" });
    const [jsonInput, setJsonInput] = useState("");
    const [jsonOutput, setJsonOutput] = useState("");
    const [mathExpression, setMathExpression] = useState("");
    const [mathResult, setMathResult] = useState("");
    const [binaryInput, setBinaryInput] = useState("");
    const [decimalOutput, setDecimalOutput] = useState("");
    const [hexInput, setHexInput] = useState("");
    const [decimalFromHex, setDecimalFromHex] = useState("");
    const [hexColor, setHexColor] = useState("#000000");
    const [rgbColor, setRgbColor] = useState({ r: 0, g: 0, b: 0 });
    const [timestamp, setTimestamp] = useState("");
    const [formattedDate, setFormattedDate] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [urlOutput, setUrlOutput] = useState("");
    const [base64Input, setBase64Input] = useState("");
    const [base64Output, setBase64Output] = useState("");
    const [htmlInput, setHtmlInput] = useState("");
    const [htmlOutput, setHtmlOutput] = useState("");
    const [regexPattern, setRegexPattern] = useState("");
    const [regexTest, setRegexTest] = useState("");
    const [regexFlags, setRegexFlags] = useState("g");
    const [regexResult, setRegexResult] = useState("");
    
    // Additional state variables for new tools
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);
    const [sortedText, setSortedText] = useState("");
    const [duplicatesRemoved, setDuplicatesRemoved] = useState("");
    const [lineNumbers, setLineNumbers] = useState("");
    const [reversedText, setReversedText] = useState("");
    const [loremIpsum, setLoremIpsum] = useState("");
    const [csvInput, setCsvInput] = useState("");
    const [xmlInput, setXmlInput] = useState("");
    const [yamlInput, setYamlInput] = useState("");
    const [markdownInput, setMarkdownInput] = useState("");
    const [markdownOutput, setMarkdownOutput] = useState("");
    const [numberToWords, setNumberToWords] = useState("");
    const [morseCodeInput, setMorseCodeInput] = useState("");
    const [morseCodeOutput, setMorseCodeOutput] = useState("");
    const [brailleInput, setBrailleInput] = useState("");
    const [brailleOutput, setBrailleOutput] = useState("");
    const [checksum, setChecksum] = useState("");
    const [hmacInput, setHmacInput] = useState("");
    const [hmacOutput, setHmacOutput] = useState("");
    const [encryptionInput, setEncryptionInput] = useState("");
    const [encryptionOutput, setEncryptionOutput] = useState("");
    const [cronExpression, setCronExpression] = useState("");
    const [sqlInput, setSqlInput] = useState("");
    const [formattedSql, setFormattedSql] = useState("");
    const [jsonValidatorInput, setJsonValidatorInput] = useState("");
    const [jsonValidatorResult, setJsonValidatorResult] = useState("");
    const [htmlMinifierInput, setHtmlMinifierInput] = useState("");
    const [htmlMinifierOutput, setHtmlMinifierOutput] = useState("");
    const [cssMinifierInput, setCssMinifierInput] = useState("");
    const [cssMinifierOutput, setCssMinifierOutput] = useState("");
    const [jsObfuscatorInput, setJsObfuscatorInput] = useState("");
    const [jsObfuscatorOutput, setJsObfuscatorOutput] = useState("");
    const [base32Input, setBase32Input] = useState("");
    const [base32Output, setBase32Output] = useState("");
    const [urlParserInput, setUrlParserInput] = useState("");
    const [urlParserResult, setUrlParserResult] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [salt, setSalt] = useState("");
    const [checksum, setChecksum] = useState("");
    const [hmacInput, setHmacInput] = useState("");
    const [hmacOutput, setHmacOutput] = useState("");
    const [encryptionInput, setEncryptionInput] = useState("");
    const [encryptionOutput, setEncryptionOutput] = useState("");
    const [gradientColors, setGradientColors] = useState([]);
    const [colorMixer, setColorMixer] = useState({ color1: "#000000", color2: "#ffffff" });
    const [tintValue, setTintValue] = useState("");
    const [shadeValue, setShadeValue] = useState("");
    const [octalOutput, setOctalOutput] = useState("");
    const [scientificExpression, setScientificExpression] = useState("");
    const [gcdLcmOutput, setGcdLcmOutput] = useState({ gcd: "", lcm: "" });
    const [primeInput, setPrimeInput] = useState("");
    const [factorialOutput, setFactorialOutput] = useState("");
    const [statsInput, setStatsInput] = useState("");
    const [date2, setDate2] = useState("");
    const [dateDifference, setDateDifference] = useState("");
    const [worldClock, setWorldClock] = useState({});
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [easterYear, setEasterYear] = useState("");
    const [easterDate, setEasterDate] = useState("");
    const [sslInfo, setSslInfo] = useState("");
    const [httpHeaders, setHttpHeaders] = useState({});
    const [networkCalc, setNetworkCalc] = useState({ ip: "", subnet: "" });
    const [networkOutput, setNetworkOutput] = useState({});
    const [jsonValidation, setJsonValidation] = useState({ valid: false, error: "" });
    const [minifiedHtml, setMinifiedHtml] = useState("");
    const [base32Input, setBase32Input] = useState("");
    const [base32Output, setBase32Output] = useState("");
    // Add canvas ref for drawing color wheel
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const drawColorWheel = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const centerY = 160;
        const radius = 160;
        canvas.width = 320;
        canvas.height = 320;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            const startAngle = (angle - 1) * Math.PI / 180;
            const endAngle = angle * Math.PI / 180;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `hsl(${angle}, 0%, 50%)`);
            
            // Draw wedge
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = gradient; // eslint-disable-next-line
            ctx.fill();
        }
        
        // Add subtle center circle for better aesthetics
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
              ctx.fillStyle = centerGradient;
        ctx.fill();
    }, []);

    // Draw color wheel when component mounts or when active tool changes to colorWheel
    useEffect(() => {
        if (activeTool === "colorWheel") {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                drawColorWheel();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeTool, drawColorWheel]);

    // Scroll to active tool when it changes
    useEffect(() => {
        if (activeTool && activeToolRef.current) {
            const timeout = setTimeout(() => {
                activeToolRef.current?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100); // Small delay to ensure the tool is rendered
            
            return () => clearTimeout(timeout);
        }
    }, [activeTool]);

    // Auto-process text input for immediate results
    useEffect(() => {
        if (activeTool === "caseConverter" && textInput) {
            transformText();
        }
    }, [textInput, caseType, activeTool]);

    useEffect(() => {
        if (activeTool === "findReplace" && textInput && findText) {
            findAndReplace();
        }
    }, [textInput, findText, replaceText, activeTool]);

    useEffect(() => {
        if (activeTool === "jsonFormatter" && jsonInput) {
            formatJson();
        }
    }, [jsonInput, activeTool]);

    useEffect(() => {
        if (activeTool === "calculator" && mathExpression) {
            calculateExpression();
        }
    }, [mathExpression, activeTool]);

    useEffect(() => {
        if (activeTool === "binaryConverter" && binaryInput) {
            convertBinary();
        }
    }, [binaryInput, activeTool]);

    useEffect(() => {
        if (activeTool === "hexConverter" && hexInput) {
            convertHex();
        }
    }, [hexInput, activeTool]);

    useEffect(() => {
        if (activeTool === "colorConverter" && hexColor) {
            convertColor();
        }
    }, [hexColor, activeTool]);

    useEffect(() => {
        if (activeTool === "timestampConverter" && timestamp) {
            convertTimestamp();
        }
    }, [timestamp, activeTool]);

    useEffect(() => {
        if (activeTool === "urlEncoder" && urlInput) {
            encodeUrl();
        }
    }, [urlInput, activeTool]);

    useEffect(() => {
        if (activeTool === "base64Encoder" && base64Input) {
            encodeBase64();
        }
    }, [base64Input, activeTool]);

    useEffect(() => {
        if (activeTool === "htmlEscape" && htmlInput) {
            escapeHtml();
        }
    }, [htmlInput, activeTool]);

    useEffect(() => {
        if (activeTool === "regexTester" && regexPattern && regexTest) {
            testRegex();
        }
    }, [regexPattern, regexTest, regexFlags, activeTool]);

    // Color conversion helper functions
    const hslToHex = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const k = (n: number) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        const r = Math.round(255 * f(0));
        const g = Math.round(255 * f(8));
        const b = Math.round(255 * f(4));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const k = (n: number) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        const r = Math.round(255 * f(0));
        const g = Math.round(255 * f(8));
        const b = Math.round(255 * f(4));
        return `rgb(${r}, ${g}, ${b})`;
    };

    // Get color at specific position on the wheel
    const getColorAtPosition = (x: number, y: number) => {
        const centerX = 160;
        const centerY = 160;
        const relX = x - centerX;
        const relY = y - centerY;
        
        // Calculate distance from center
        const distance = Math.sqrt(relX * relX + relY * relY);
        const maxRadius = 160;
        
        if (distance <= maxRadius) {
            // Calculate angle and convert to hue
            let angle = Math.atan2(relY, relX) * (180 / Math.PI);
            angle = (angle + 360) % 360;
            
            // Calculate saturation based on distance (100% at edge, 0% at center)
            const saturation = (distance / maxRadius) * 100;
            
            // Lightness is fixed at 50% for vibrant colors
            return { h: angle, s: saturation, l: 50 };
        }
        
        return { h: 0, s: 0, l: 50 };
    };

    const updateColorFromPosition = (x: number, y: number) => {
        const color = getColorAtPosition(x, y);
        setSelectedHsl(color);
        
        // Update complementary color
        const complementaryAngle = (color.h + 180) % 360;
        setComplementaryHsl({ h: complementaryAngle, s: color.s, l: 50 });
        
        // Update colorPicker for compatibility
        setColorPicker(hslToHex(color.h, color.s, 50));
    };

    // Tool Functions
    const transformText = () => {
        if (!textInput) return;
        let result = "";
        switch (caseType) {
            case "uppercase":
                result = textInput.toUpperCase();
                break;
            case "lowercase":
                result = textInput.toLowerCase();
                break;
            case "title":
                result = textInput.replace(/\w\S*/g, (txt) => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
            case "sentence":
                result = textInput.charAt(0).toUpperCase() + textInput.slice(1).toLowerCase();
                break;
            case "camelCase":
                result = textInput.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                    index === 0 ? word.toLowerCase() : word.toUpperCase()
                ).replace(/\s+/g, '');
                break;
            case "snakeCase":
                result = textInput.replace(/\W+/g, ' ')
                    .split(/ |\B(?=[A-Z])/)
                    .map(word => word.toLowerCase())
                    .join('_');
                break;
            case "kebabCase":
                result = textInput.replace(/\W+/g, ' ')
                    .split(/ |\B(?=[A-Z])/)
                    .map(word => word.toLowerCase())
                    .join('-');
                break;
            default:
                result = textInput;
        }
        setTextOutput(result);
    };

    const findAndReplace = () => {
        if (!textInput || !findText) return;
        const result = textInput.replace(new RegExp(findText, 'g'), replaceText);
        setTextOutput(result);
    };

    const formatJson = () => {
        if (!jsonInput) return;
        try {
            const parsed = JSON.parse(jsonInput);
            const formatted = JSON.stringify(parsed, null, 2);
            setJsonOutput(formatted);
        } catch (error) {
            setJsonOutput("Invalid JSON format");
        }
    };

    const calculateExpression = () => {
        if (!mathExpression) return;
        try {
            // Safe evaluation (in real app, use a proper math parser)
            const result = Function('"use strict"; return (' + mathExpression + ')')();
            setMathResult(result.toString());
        } catch (error) {
            setMathResult("Invalid expression");
        }
    };

    const convertBinary = () => {
        if (!binaryInput) return;
        try {
            const decimal = parseInt(binaryInput, 2);
            setDecimalOutput(decimal.toString());
        } catch (error) {
            setDecimalOutput("Invalid binary");
        }
    };

    const convertHex = () => {
        if (!hexInput) return;
        try {
            const decimal = parseInt(hexInput, 16);
            setDecimalFromHex(decimal.toString());
        } catch (error) {
            setDecimalFromHex("Invalid hex");
        }
    };

    const convertColor = () => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        setRgbColor({ r, g, b });
    };

    const convertTimestamp = () => {
        if (!timestamp) return;
        try {
            const date = new Date(parseInt(timestamp) * 1000);
            setFormattedDate(date.toLocaleString());
        } catch (error) {
            setFormattedDate("Invalid timestamp");
        }
    };

    const encodeUrl = () => {
        if (!urlInput) return;
        setUrlOutput(encodeURIComponent(urlInput));
    };

    const encodeBase64 = () => {
        if (!base64Input) return;
        try {
            setBase64Output(btoa(base64Input));
        } catch (error) {
            setBase64Output("Encoding failed");
        }
    };

    const escapeHtml = () => {
        if (!htmlInput) return;
        const escaped = htmlInput
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        setHtmlOutput(escaped);
    };

    const testRegex = () => {
        if (!regexPattern || !regexTest) return;
        try {
            const regex = new RegExp(regexPattern, regexFlags);
            const matches = [];
            let match;
            
            // Find all matches using exec() in a loop
            while ((match = regex.exec(regexTest)) !== null) {
                matches.push(match[0]);
            }
            
            if (matches.length > 0) {
                const matchDetails = matches.map((match, index) => {
                    const startIndex = regexTest.lastIndexOf(match, 0, index);
                    const endIndex = startIndex + match.length;
                    return `Match ${index + 1}: "${match}" (positions ${startIndex}-${endIndex})`;
                }).join('\n');
                setRegexResult(matchDetails);
            } else {
                setRegexResult('No matches found');
            }
        } catch (error) {
            setRegexResult('Invalid regex pattern: ' + error.message);
        }
    };

    // Helper functions for new tools
    const numToWords = (num) => {
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        
        if (num === 0) return 'zero';
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numToWords(num % 100) : '');
        return num.toString(); // For larger numbers, just return the string
    };

    const textToMorse = (text) => {
        const morseCode = {
            'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
            'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
            'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
            's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
            'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', ' ': '/'
        };
        return text.toLowerCase().split('').map(char => morseCode[char] || char).join(' ');
    };

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < passwordLength; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setGeneratedPassword(password);
        toast({
            title: "Password generated! 🔐",
            description: "New password has been copied to clipboard",
        });
        navigator.clipboard.writeText(password);
    };

    const generateHash = () => {
        if (!hashInput) return;
        // Simple hash simulation (in real app, use crypto library)
        setHashOutput({
            md5: btoa(hashInput).slice(0, 32),
            sha1: btoa(hashInput + "sha1").slice(0, 40),
            sha256: btoa(hashInput + "sha256").slice(0, 64),
            sha512: btoa(hashInput + "sha512").slice(0, 128),
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard! 📋",
            description: "Text has been copied successfully",
        });
    };

    const clearAll = () => {
        setTextInput("");
        setTextOutput("");
        setFindText("");
        setReplaceText("");
        setJsonInput("");
        setJsonOutput("");
        setMathExpression("");
        setMathResult("");
        setBinaryInput("");
        setDecimalOutput("");
        setHexInput("");
        setDecimalFromHex("");
        setHashInput("");
        setHashOutput({ md5: "", sha1: "", sha256: "", sha512: "" });
        setUrlInput("");
        setUrlOutput("");
        setBase64Input("");
        setBase64Output("");
        setHtmlInput("");
        setHtmlOutput("");
        setRegexPattern("");
        setRegexTest("");
        setRegexResult("");
        setTimestamp("");
        setFormattedDate("");
    };

    const renderToolInterface = () => {
        if (!activeTool) return null;

        switch (activeTool) {
            case "caseConverter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Input Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Type or paste your text here..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Output</label>
                                <Textarea
                                    value={textOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["uppercase", "lowercase", "title", "sentence", "camelCase", "snakeCase", "kebabCase"].map((type) => (
                                <Button
                                    key={type}
                                    variant={caseType === type ? "default" : "outline"}
                                    onClick={() => setCaseType(type)}
                                    className="capitalize"
                                >
                                    {type.replace(/([A-Z])/g, ' $1').trim()}
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                );

            case "findReplace":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                value={findText}
                                onChange={(e) => setFindText(e.target.value)}
                                placeholder="Find text..."
                            />
                            <Input
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                                placeholder="Replace with..."
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Original Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Enter text to search and replace..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Result</label>
                                <Textarea
                                    value={textOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "jsonFormatter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">JSON Input</label>
                                <Textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder='{"key": "value"}'
                                    className="min-h-32 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Formatted JSON</label>
                                <Textarea
                                    value={jsonOutput}
                                    readOnly
                                    className="min-h-32 font-mono bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "calculator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="max-w-md mx-auto">
                            <Input
                                value={mathExpression}
                                onChange={(e) => setMathExpression(e.target.value)}
                                placeholder="Enter mathematical expression (e.g., 2 + 3 * 4)"
                                className="text-lg text-center"
                            />
                            {mathResult && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mt-4 p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-center"
                                >
                                    <div className="text-sm opacity-80">Result</div>
                                    <div className="text-3xl font-bold">{mathResult}</div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );

            case "binaryConverter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Binary</label>
                                <Input
                                    value={binaryInput}
                                    onChange={(e) => setBinaryInput(e.target.value)}
                                    placeholder="1010"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Decimal</label>
                                <Input
                                    value={decimalOutput}
                                    readOnly
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "hexConverter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Hexadecimal</label>
                                <Input
                                    value={hexInput}
                                    onChange={(e) => setHexInput(e.target.value)}
                                    placeholder="FF"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Decimal</label>
                                <Input
                                    value={decimalFromHex}
                                    readOnly
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "colorConverter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Hex Color</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={hexColor}
                                        onChange={(e) => setHexColor(e.target.value)}
                                        placeholder="#000000"
                                    />
                                    <div 
                                        className="w-12 h-10 rounded border-2 border-gray-300"
                                        style={{ backgroundColor: hexColor }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">RGB</label>
                                <Input
                                    value={`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`}
                                    readOnly
                                    className="bg-gradient-to-r from-purple-50 to-pink-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "timestampConverter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Unix Timestamp</label>
                                <Input
                                    value={timestamp}
                                    onChange={(e) => setTimestamp(e.target.value)}
                                    placeholder="1640995200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date & Time</label>
                                <Input
                                    value={formattedDate}
                                    readOnly
                                    className="bg-gradient-to-r from-yellow-50 to-orange-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "urlEncoder":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">URL</label>
                                <Textarea
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://example.com/path?query=value"
                                    className="min-h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Encoded URL</label>
                                <Textarea
                                    value={urlOutput}
                                    readOnly
                                    className="min-h-24 bg-gradient-to-r from-cyan-50 to-blue-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "base64Encoder":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Text</label>
                                <Textarea
                                    value={base64Input}
                                    onChange={(e) => setBase64Input(e.target.value)}
                                    placeholder="Enter text to encode..."
                                    className="min-h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Base64</label>
                                <Textarea
                                    value={base64Output}
                                    readOnly
                                    className="min-h-24 bg-gradient-to-r from-red-50 to-orange-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "htmlEscape":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">HTML</label>
                                <Textarea
                                    value={htmlInput}
                                    onChange={(e) => setHtmlInput(e.target.value)}
                                    placeholder="<div>Hello & World</div>"
                                    className="min-h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Escaped HTML</label>
                                <Textarea
                                    value={htmlOutput}
                                    readOnly
                                    className="min-h-24 bg-gradient-to-r from-gray-50 to-gray-100"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "regexTester":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-4 gap-4">
                            <Input
                                value={regexPattern}
                                onChange={(e) => setRegexPattern(e.target.value)}
                                placeholder="Regex pattern (e.g., \\d+)"
                            />
                            <Input
                                value={regexTest}
                                onChange={(e) => setRegexTest(e.target.value)}
                                placeholder="Test text"
                            />
                            <Input
                                value={regexFlags}
                                onChange={(e) => setRegexFlags(e.target.value)}
                                placeholder="Flags (e.g., g, i, m)"
                            />
                            <Button
                                onClick={testRegex}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 mr-2"
                            >
                                Test Regex
                            </Button>
                            <Button
                                onClick={() => {
                                    setRegexPattern('');
                                    setRegexTest('');
                                    setRegexFlags('');
                                    setRegexResult('');
                                }}
                                variant="outline"
                                className="hover:bg-gray-100"
                            >
                                Clear
                            </Button>
                        </div>
                        {regexResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                            >
                                <div className="text-sm font-medium mb-2">Test Results:</div>
                                <div className="font-mono text-sm bg-white p-3 rounded border border-gray-300 max-h-32 overflow-y-auto">
                                    {regexResult}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                );

            case "passwordGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="flex items-center gap-4 mb-4">
                                <Input
                                    type="number"
                                    value={passwordLength}
                                    onChange={(e) => setPasswordLength(parseInt(e.target.value) || 16)}
                                    min={8}
                                    max={128}
                                />
                                <Button onClick={generatePassword} className="flex-1">
                                    <Key className="h-4 w-4 mr-2" />
                                    Generate Password
                                </Button>
                            </div>
                            {generatedPassword && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-mono text-lg">{showPassword ? generatedPassword : "•".repeat(generatedPassword.length)}</div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(generatedPassword)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );

            case "hashGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Textarea
                            value={hashInput}
                            onChange={(e) => setHashInput(e.target.value)}
                            placeholder="Enter text to generate hashes..."
                            className="min-h-24"
                        />
                        {hashOutput.md5 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                {Object.entries(hashOutput).map(([algorithm, hash]) => (
                                    <div key={algorithm} className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                                        <div className="text-sm font-medium mb-1">{algorithm.toUpperCase()}:</div>
                                        <div className="font-mono text-sm break-all">{hash}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                );

            case "uuidGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex gap-4 mb-4">
                            <Button onClick={() => {
                                const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                                    const r = Math.random() * 16 | 0;
                                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                                    return v.toString(16);
                                });
                                setGeneratedPassword(uuid);
                            }}>
                                Generate UUID
                            </Button>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Generated UUID:</div>
                            <div className="font-mono text-sm break-all">{generatedPassword}</div>
                        </div>
                    </motion.div>
                );

            case "jwtDecoder":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Textarea
                            value={textInput}
                            onChange={(e) => {
                                setTextInput(e.target.value);
                                try {
                                    const parts = e.target.value.split('.');
                                    if (parts.length === 3) {
                                        const header = JSON.parse(atob(parts[0]));
                                        const payload = JSON.parse(atob(parts[1]));
                                        setTextOutput(`Header: ${JSON.stringify(header, null, 2)}\n\nPayload: ${JSON.stringify(payload, null, 2)}`);
                                    } else {
                                        setTextOutput("Invalid JWT format");
                                    }
                                } catch (error) {
                                    setTextOutput("Invalid JWT token");
                                }
                            }}
                            placeholder="Enter JWT token to decode..."
                            className="min-h-32"
                        />
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Decoded JWT:</div>
                            <pre className="text-sm whitespace-pre-wrap">{textOutput}</pre>
                        </div>
                    </motion.div>
                );

            case "qrGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Text/URL for QR Code</label>
                            <Textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Enter text or URL to generate QR code..."
                                className="min-h-24"
                            />
                        </div>
                        <Button onClick={() => {
                            if (textInput) {
                                // In a real app, you would use a QR code library
                                setTextOutput(`QR Code would be generated for: ${textInput}\n\nNote: QR code generation requires a specialized library.`);
                            }
                        }}>
                            Generate QR Code
                        </Button>
                        {textOutput && (
                            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                                <div className="text-sm">{textOutput}</div>
                            </div>
                        )}
                    </motion.div>
                );

            case "passwordStrength":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Password to Test</label>
                            <Input
                                type="password"
                                value={textInput}
                                onChange={(e) => {
                                    setTextInput(e.target.value);
                                    const password = e.target.value;
                                    let strength = 0;
                                    let feedback = [];
                                    
                                    if (password.length >= 8) strength++;
                                    else feedback.push("Add at least 8 characters");
                                    
                                    if (/[a-z]/.test(password)) strength++;
                                    else feedback.push("Add lowercase letters");
                                    
                                    if (/[A-Z]/.test(password)) strength++;
                                    else feedback.push("Add uppercase letters");
                                    
                                    if (/[0-9]/.test(password)) strength++;
                                    else feedback.push("Add numbers");
                                    
                                    if (/[^a-zA-Z0-9]/.test(password)) strength++;
                                    else feedback.push("Add special characters");
                                    
                                    const strengthText = strength <= 2 ? "Weak" : strength <= 3 ? "Medium" : strength <= 4 ? "Strong" : "Very Strong";
                                    const strengthColor = strength <= 2 ? "red" : strength <= 3 ? "yellow" : strength <= 4 ? "green" : "blue";
                                    
                                    setTextOutput(`Strength: ${strengthText}\n\nSuggestions:\n${feedback.join('\n')}`);
                                }}
                                placeholder="Enter password to test..."
                            />
                        </div>
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Password Analysis:</div>
                            <pre className="text-sm whitespace-pre-wrap">{textOutput}</pre>
                        </div>
                    </motion.div>
                );

            // Text Tools
            case "wordCounter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Textarea
                            value={textInput}
                            onChange={(e) => {
                                setTextInput(e.target.value);
                                const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0;
                                const chars = e.target.value.length;
                                setWordCount(words);
                                setCharacterCount(chars);
                            }}
                            placeholder="Type or paste your text here..."
                            className="min-h-32"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                                <div className="text-sm font-medium mb-1">Words:</div>
                                <div className="text-2xl font-bold">{wordCount}</div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                                <div className="text-sm font-medium mb-1">Characters:</div>
                                <div className="text-2xl font-bold">{characterCount}</div>
                            </div>
                        </div>
                    </motion.div>
                );

            case "characterCounter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Textarea
                            value={textInput}
                            onChange={(e) => {
                                setTextInput(e.target.value);
                                setCharacterCount(e.target.value.length);
                            }}
                            placeholder="Type or paste your text here..."
                            className="min-h-32"
                        />
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                            <div className="text-sm font-medium mb-1">Character Count:</div>
                            <div className="text-2xl font-bold">{characterCount}</div>
                        </div>
                    </motion.div>
                );

            case "sortLines":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Input Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        const lines = e.target.value.split('\n').filter(line => line.trim());
                                        const sorted = lines.sort((a, b) => a.localeCompare(b)).join('\n');
                                        setSortedText(sorted);
                                    }}
                                    placeholder="Enter lines to sort..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Sorted Output</label>
                                <Textarea
                                    value={sortedText}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "removeDuplicates":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Input Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        const lines = e.target.value.split('\n');
                                        const unique = [...new Set(lines)];
                                        setDuplicatesRemoved(unique.join('\n'));
                                    }}
                                    placeholder="Enter text to remove duplicates..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Duplicates Removed</label>
                                <Textarea
                                    value={duplicatesRemoved}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "addLineNumbers":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Input Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        const lines = e.target.value.split('\n');
                                        const numbered = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
                                        setLineNumbers(numbered);
                                    }}
                                    placeholder="Enter text to add line numbers..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">With Line Numbers</label>
                                <Textarea
                                    value={lineNumbers}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "reverseText":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Input Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        setReversedText(e.target.value.split('').reverse().join(''));
                                    }}
                                    placeholder="Enter text to reverse..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Reversed Text</label>
                                <Textarea
                                    value={reversedText}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "loremIpsum":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex gap-4 mb-4">
                            <Button onClick={() => {
                                const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
                                const count = 50;
                                const result = Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
                                setLoremIpsum(result.charAt(0).toUpperCase() + result.slice(1) + '.');
                            }}>
                                Generate Lorem Ipsum
                            </Button>
                        </div>
                        <Textarea
                            value={loremIpsum}
                            readOnly
                            placeholder="Click the button to generate Lorem Ipsum text..."
                            className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                        />
                    </motion.div>
                );

            case "textExtractor":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Input Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        // Extract emails, URLs, and phone numbers
                                        const emails = e.target.value.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
                                        const urls = e.target.value.match(/https?:\/\/[^\s]+/g) || [];
                                        const phones = e.target.value.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];
                                        
                                        const extracted = {
                                            emails: emails.join(', ') || 'No emails found',
                                            urls: urls.join(', ') || 'No URLs found',
                                            phones: phones.join(', ') || 'No phone numbers found'
                                        };
                                        
                                        setTextOutput(JSON.stringify(extracted, null, 2));
                                    }}
                                    placeholder="Enter text to extract emails, URLs, and phone numbers..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Extracted Data</label>
                                <Textarea
                                    value={textOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "textDiff":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Original Text</label>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Enter original text..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Modified Text</label>
                                <Textarea
                                    value={findText}
                                    onChange={(e) => setFindText(e.target.value)}
                                    placeholder="Enter modified text..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Differences</label>
                                <Textarea
                                    value={textOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-blue-50 to-cyan-50"
                                />
                            </div>
                        </div>
                        <Button onClick={() => {
                            const original = textInput.split('\n');
                            const modified = findText.split('\n');
                            const differences = [];
                            
                            const maxLines = Math.max(original.length, modified.length);
                            for (let i = 0; i < maxLines; i++) {
                                const origLine = original[i] || '';
                                const modLine = modified[i] || '';
                                
                                if (origLine !== modLine) {
                                    differences.push(`Line ${i + 1}: "${origLine}" → "${modLine}"`);
                                }
                            }
                            
                            setTextOutput(differences.length > 0 ? differences.join('\n') : 'No differences found');
                        }}>
                            Compare Text
                        </Button>
                    </motion.div>
                );

            case "textToSpeech":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Text to Speech</label>
                            <Textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Enter text to convert to speech..."
                                className="min-h-32"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={() => {
                                if ('speechSynthesis' in window && textInput) {
                                    const utterance = new SpeechSynthesisUtterance(textInput);
                                    speechSynthesis.speak(utterance);
                                    toast({
                                        title: "Speaking",
                                        description: "Text is being read aloud",
                                    });
                                } else {
                                    toast({
                                        title: "Not Supported",
                                        description: "Speech synthesis is not supported in your browser",
                                        variant: "destructive"
                                    });
                                }
                            }}>
                                <Mic className="h-4 w-4 mr-2" />
                                Speak Text
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    if ('speechSynthesis' in window) {
                                        speechSynthesis.cancel();
                                        toast({
                                            title: "Stopped",
                                            description: "Speech has been stopped",
                                        });
                                    }
                                }}
                            >
                                Stop Speaking
                            </Button>
                        </div>
                    </motion.div>
                );

            // Data Converters
            case "csvToJson":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">CSV Input</label>
                                <Textarea
                                    value={csvInput}
                                    onChange={(e) => {
                                        setCsvInput(e.target.value);
                                        try {
                                            const lines = e.target.value.trim().split('\n');
                                            const headers = lines[0].split(',');
                                            const data = lines.slice(1).map(line => {
                                                const values = line.split(',');
                                                const obj = {};
                                                headers.forEach((header, index) => {
                                                    obj[header.trim()] = values[index]?.trim() || '';
                                                });
                                                return obj;
                                            });
                                            setJsonOutput(JSON.stringify(data, null, 2));
                                        } catch (error) {
                                            setJsonOutput("Invalid CSV format");
                                        }
                                    }}
                                    placeholder="name,age,city&#10;John,25,NYC&#10;Jane,30,LA"
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">JSON Output</label>
                                <Textarea
                                    value={jsonOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "xmlToJson":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">XML Input</label>
                                <Textarea
                                    value={xmlInput}
                                    onChange={(e) => {
                                        setXmlInput(e.target.value);
                                        setJsonOutput("XML to JSON conversion requires server-side processing");
                                    }}
                                    placeholder="<root>&#10;  <item>value</item>&#10;</root>"
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">JSON Output</label>
                                <Textarea
                                    value={jsonOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "yamlToJson":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">YAML Input</label>
                                <Textarea
                                    value={yamlInput}
                                    onChange={(e) => {
                                        setYamlInput(e.target.value);
                                        setJsonOutput("YAML to JSON conversion requires server-side processing");
                                    }}
                                    placeholder="key: value&#10;array:&#10;  - item1&#10;  - item2"
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">JSON Output</label>
                                <Textarea
                                    value={jsonOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "markdownToHtml":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Markdown Input</label>
                                <Textarea
                                    value={markdownInput}
                                    onChange={(e) => {
                                        setMarkdownInput(e.target.value);
                                        // Simple markdown to HTML conversion
                                        let html = e.target.value
                                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                            .replace(/\*(.*)\*/gim, '<em>$1</em>')
                                            .replace(/\n/gim, '<br>');
                                        setMarkdownOutput(html);
                                    }}
                                    placeholder="# Heading&#10;## Subheading&#10;**Bold text**&#10;*Italic text*"
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">HTML Output</label>
                                <Textarea
                                    value={markdownOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "numberToWords":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Number</label>
                                <Input
                                    type="number"
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        const num = parseInt(e.target.value);
                                        if (!isNaN(num)) {
                                            const words = numToWords(num);
                                            setNumberToWords(words);
                                        } else {
                                            setNumberToWords("");
                                        }
                                    }}
                                    placeholder="123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Words</label>
                                <Textarea
                                    value={numberToWords}
                                    readOnly
                                    className="min-h-24 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "morseCode":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Text</label>
                                <Textarea
                                    value={morseCodeInput}
                                    onChange={(e) => {
                                        setMorseCodeInput(e.target.value);
                                        const morse = textToMorse(e.target.value);
                                        setMorseCodeOutput(morse);
                                    }}
                                    placeholder="Enter text to convert to Morse code..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Morse Code</label>
                                <Textarea
                                    value={morseCodeOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "brailleTranslator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Text</label>
                                <Textarea
                                    value={brailleInput}
                                    onChange={(e) => {
                                        setBrailleInput(e.target.value);
                                        setBrailleOutput("Braille translation requires specialized library");
                                    }}
                                    placeholder="Enter text to translate to Braille..."
                                    className="min-h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Braille</label>
                                <Textarea
                                    value={brailleOutput}
                                    readOnly
                                    className="min-h-32 bg-gradient-to-r from-green-50 to-emerald-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            // Security Tools
            case "apiKeyGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex gap-4 mb-4">
                            <Button onClick={() => {
                                const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                let key = "";
                                for (let i = 0; i < 32; i++) {
                                    key += charset.charAt(Math.floor(Math.random() * charset.length));
                                }
                                setApiKey(key);
                            }}>
                                Generate API Key
                            </Button>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Generated API Key:</div>
                            <div className="font-mono text-sm break-all">{apiKey}</div>
                        </div>
                    </motion.div>
                );

            case "saltGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex gap-4 mb-4">
                            <Button onClick={() => {
                                const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                                let salt = "";
                                for (let i = 0; i < 16; i++) {
                                    salt += charset.charAt(Math.floor(Math.random() * charset.length));
                                }
                                setSalt(salt);
                            }}>
                                Generate Salt
                            </Button>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Generated Salt:</div>
                            <div className="font-mono text-sm break-all">{salt}</div>
                        </div>
                    </motion.div>
                );

            case "checksum":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Textarea
                            value={textInput}
                            onChange={(e) => {
                                setTextInput(e.target.value);
                                let hash = 0;
                                for (let i = 0; i < e.target.value.length; i++) {
                                    const char = e.target.value.charCodeAt(i);
                                    hash = ((hash << 5) - hash) + char;
                                    hash = hash & hash;
                                }
                                setChecksum(hash.toString(16));
                            }}
                            placeholder="Enter text to generate checksum..."
                            className="min-h-32"
                        />
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Checksum:</div>
                            <div className="font-mono text-sm">{checksum}</div>
                        </div>
                    </motion.div>
                );

            case "hmacGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <Textarea
                                    value={hmacInput}
                                    onChange={(e) => setHmacInput(e.target.value)}
                                    placeholder="Enter message..."
                                    className="min-h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Secret Key</label>
                                <Input
                                    type="password"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Enter secret key..."
                                />
                            </div>
                        </div>
                        <Button onClick={() => {
                            if (hmacInput && textInput) {
                                // Simple HMAC simulation (in real app, use crypto library)
                                const combined = hmacInput + textInput;
                                let hash = 0;
                                for (let i = 0; i < combined.length; i++) {
                                    const char = combined.charCodeAt(i);
                                    hash = ((hash << 5) - hash) + char;
                                    hash = hash & hash;
                                }
                                setHmacOutput(hash.toString(16));
                            }
                        }}>
                            Generate HMAC
                        </Button>
                        {hmacOutput && (
                            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                                <div className="text-sm font-medium mb-2">HMAC:</div>
                                <div className="font-mono text-sm">{hmacOutput}</div>
                            </div>
                        )}
                    </motion.div>
                );

            case "tokenValidator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Textarea
                            value={tokenInput}
                            onChange={(e) => {
                                setTokenInput(e.target.value);
                                try {
                                    const parts = e.target.value.split('.');
                                    if (parts.length === 3) {
                                        const header = JSON.parse(atob(parts[0]));
                                        const payload = JSON.parse(atob(parts[1]));
                                        setTokenOutput(`Valid JWT Token\nHeader: ${JSON.stringify(header, null, 2)}\nPayload: ${JSON.stringify(payload, null, 2)}`);
                                    } else {
                                        setTokenOutput("Invalid JWT format");
                                    }
                                } catch (error) {
                                    setTokenOutput("Invalid token format");
                                }
                            }}
                            placeholder="Enter JWT token to validate..."
                            className="min-h-32"
                        />
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Validation Result:</div>
                            <pre className="text-sm whitespace-pre-wrap">{tokenOutput}</pre>
                        </div>
                    </motion.div>
                );

            case "encryptionTool":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Text to Encrypt</label>
                                <Textarea
                                    value={encryptionInput}
                                    onChange={(e) => setEncryptionInput(e.target.value)}
                                    placeholder="Enter text to encrypt..."
                                    className="min-h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Encrypted Output</label>
                                <Textarea
                                    value={encryptionOutput}
                                    readOnly
                                    className="min-h-24 bg-gradient-to-r from-red-50 to-orange-50"
                                />
                            </div>
                        </div>
                        <Button onClick={() => {
                            if (encryptionInput) {
                                // Simple Caesar cipher (in real app, use proper encryption)
                                const encrypted = encryptionInput.split('').map(char => {
                                    const code = char.charCodeAt(0);
                                    return String.fromCharCode(code + 3);
                                }).join('');
                                setEncryptionOutput(btoa(encrypted));
                            }
                        }}>
                            Encrypt Text
                        </Button>
                    </motion.div>
                );

            // Color Tools
            case "colorPicker":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-6">
                            <input
                                type="color"
                                value={colorPicker}
                                onChange={(e) => setColorPicker(e.target.value)}
                                className="w-32 h-32 border-2 border-gray-300 rounded cursor-pointer"
                            />
                            <div>
                                <div className="text-sm font-medium mb-2">Selected Color:</div>
                                <div className="font-mono text-lg">{colorPicker}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    RGB: {parseInt(colorPicker.slice(1, 3), 16)}, {parseInt(colorPicker.slice(3, 5), 16)}, {parseInt(colorPicker.slice(5, 7), 16)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case "colorPalette":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Button onClick={() => {
                            const colors = [];
                            for (let i = 0; i < 5; i++) {
                                const color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                                colors.push(color);
                            }
                            setColorPalette(colors);
                        }}>
                            Generate Color Palette
                        </Button>
                        <div className="grid grid-cols-5 gap-4">
                            {colorPalette.map((color, index) => (
                                <div key={index} className="text-center">
                                    <div 
                                        className="w-full h-20 rounded border-2 border-gray-300 mb-2"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="text-xs font-mono">{color}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );

            case "gradientGenerator":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Start Color</label>
                                <input
                                    type="color"
                                    value={colorMixer.color1}
                                    onChange={(e) => setColorMixer({...colorMixer, color1: e.target.value})}
                                    className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">End Color</label>
                                <input
                                    type="color"
                                    value={colorMixer.color2}
                                    onChange={(e) => setColorMixer({...colorMixer, color2: e.target.value})}
                                    className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                        <div 
                            className="w-full h-32 rounded border-2 border-gray-300"
                            style={{ background: `linear-gradient(to right, ${colorMixer.color1}, ${colorMixer.color2})` }}
                        />
                        <div className="font-mono text-sm">
                            background: linear-gradient(to right, {colorMixer.color1}, {colorMixer.color2})
                        </div>
                    </motion.div>
                );

            case "colorMixer":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Color 1</label>
                                <input
                                    type="color"
                                    value={colorMixer.color1}
                                    onChange={(e) => setColorMixer({...colorMixer, color1: e.target.value})}
                                    className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Color 2</label>
                                <input
                                    type="color"
                                    value={colorMixer.color2}
                                    onChange={(e) => setColorMixer({...colorMixer, color2: e.target.value})}
                                    className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                        <Button onClick={() => {
                            const r1 = parseInt(colorMixer.color1.slice(1, 3), 16);
                            const g1 = parseInt(colorMixer.color1.slice(3, 5), 16);
                            const b1 = parseInt(colorMixer.color1.slice(5, 7), 16);
                            const r2 = parseInt(colorMixer.color2.slice(1, 3), 16);
                            const g2 = parseInt(colorMixer.color2.slice(3, 5), 16);
                            const b2 = parseInt(colorMixer.color2.slice(5, 7), 16);
                            
                            const mixed = {
                                r: Math.round((r1 + r2) / 2),
                                g: Math.round((g1 + g2) / 2),
                                b: Math.round((b1 + b2) / 2)
                            };
                            
                            const mixedColor = '#' + [mixed.r, mixed.g, mixed.b].map(x => x.toString(16).padStart(2, '0')).join('');
                            setExtractedColor(mixedColor);
                        }}>
                            Mix Colors
                        </Button>
                        {extractedColor && (
                            <div className="flex items-center gap-6">
                                <div 
                                    className="w-24 h-24 rounded border-2 border-gray-300"
                                    style={{ backgroundColor: extractedColor }}
                                />
                                <div>
                                    <div className="text-sm font-medium mb-2">Mixed Color:</div>
                                    <div className="font-mono text-lg">{extractedColor}</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );

            case "colorBlindness":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-6">
                            <input
                                type="color"
                                value={colorPicker}
                                onChange={(e) => setColorPicker(e.target.value)}
                                className="w-32 h-32 border-2 border-gray-300 rounded cursor-pointer"
                            />
                            <div>
                                <div className="text-sm font-medium mb-2">Original Color</div>
                                <div className="font-mono text-lg">{colorPicker}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-sm font-medium mb-2">Normal Vision</div>
                                <div className="w-full h-20 rounded border-2 border-gray-300" style={{ backgroundColor: colorPicker }} />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium mb-2">Protanopia</div>
                                <div className="w-full h-20 rounded border-2 border-gray-300" style={{ backgroundColor: colorPicker }} />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium mb-2">Deuteranopia</div>
                                <div className="w-full h-20 rounded border-2 border-gray-300" style={{ backgroundColor: colorPicker }} />
                            </div>
                        </div>
                    </motion.div>
                );

            case "colorContrast":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Foreground Color</label>
                                <input
                                    type="color"
                                    value={colorMixer.color1}
                                    onChange={(e) => setColorMixer({...colorMixer, color1: e.target.value})}
                                    className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Background Color</label>
                                <input
                                    type="color"
                                    value={colorMixer.color2}
                                    onChange={(e) => setColorMixer({...colorMixer, color2: e.target.value})}
                                    className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="p-8 rounded border-2 border-gray-300" style={{ backgroundColor: colorMixer.color2, color: colorMixer.color1 }}>
                            <div className="text-center text-lg font-medium">
                                Sample Text
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            Contrast ratio calculation requires specialized library
                        </div>
                    </motion.div>
                );

            case "colorScheme":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Base Color</label>
                            <input
                                type="color"
                                value={colorPicker}
                                onChange={(e) => {
                                    setColorPicker(e.target.value);
                                    // Generate complementary colors
                                    const base = e.target.value;
                                    const schemes = [
                                        base, // Original
                                        // Complementary (simplified)
                                        '#' + (255 - parseInt(base.slice(1, 3), 16)).toString(16).padStart(2, '0') +
                                        (255 - parseInt(base.slice(3, 5), 16)).toString(16).padStart(2, '0') +
                                        (255 - parseInt(base.slice(5, 7), 16)).toString(16).padStart(2, '0')
                                    ];
                                    setColorScheme(schemes);
                                }}
                                className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {colorScheme.map((color, index) => (
                                <div key={index} className="text-center">
                                    <div 
                                        className="w-full h-20 rounded border-2 border-gray-300 mb-2"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="text-xs font-mono">{color}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );

            case "colorExtractor":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Image URL or Color</label>
                            <Input
                                value={textInput}
                                onChange={(e) => {
                                    setTextInput(e.target.value);
                                    setExtractedColor(e.target.value);
                                }}
                                placeholder="Enter image URL or hex color..."
                            />
                        </div>
                        <Button onClick={() => {
                            if (textInput.startsWith('#')) {
                                setExtractedColor(textInput);
                            } else {
                                setExtractedColor("Color extraction from images requires specialized library");
                            }
                        }}>
                            Extract Color
                        </Button>
                        {extractedColor && (
                            <div className="flex items-center gap-6">
                                <div 
                                    className="w-24 h-24 rounded border-2 border-gray-300"
                                    style={{ backgroundColor: extractedColor.startsWith('#') ? extractedColor : '#ccc' }}
                                />
                                <div>
                                    <div className="text-sm font-medium mb-2">Extracted Color:</div>
                                    <div className="font-mono text-lg">{extractedColor}</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );

            case "colorWheel":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                            {/* Color Wheel Container */}
                            <div className="relative">
                                <div 
                                    className="w-80 h-80 rounded-full relative border-4 border-gray-300 shadow-2xl overflow-hidden"
                                    onMouseDown={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const y = e.clientY - rect.top;
                                        
                                        // Check if click is within wheel
                                        const centerX = 160;
                                        const centerY = 160;
                                        const relX = x - centerX;
                                        const relY = y - centerY;
                                        const distance = Math.sqrt(relX * relX + relY * relY);
                                        
                                        if (distance <= 160) {
                                            setIsDragging(true);
                                            setWheelPosition({ x, y });
                                            updateColorFromPosition(x, y);
                                        }
                                    }}
                                    onMouseMove={(e) => {
                                        if (isDragging) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;
                                            
                                            // Keep within wheel bounds
                                            const centerX = 160;
                                            const centerY = 160;
                                            const relX = x - centerX;
                                            const relY = y - centerY;
                                            const distance = Math.sqrt(relX * relX + relY * relY);
                                            
                                            if (distance <= 160) {
                                                setWheelPosition({ x, y });
                                                updateColorFromPosition(x, y);
                                            }
                                        }
                                    }}
                                    onMouseUp={() => setIsDragging(false)}
                                    onMouseLeave={() => setIsDragging(false)}
                                >
                                    {/* Canvas for color wheel */}
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 w-full h-full cursor-crosshair"
                                        style={{ borderRadius: '50%' }}
                                        onClick={() => {
                                            // Redraw canvas if it appears white
                                            const ctx = canvasRef.current?.getContext('2d');
                                            if (ctx) {
                                                const imageData = ctx.getImageData(160, 160, 1, 1);
                                                if (imageData.data[3] === 0) { // Check if pixel is transparent
                                                    drawColorWheel();
                                                }
                                            }
                                        }}
                                    />
                                    
                                    {/* Draggable User Circle */}
                                    <div 
                                        className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-move z-10"
                                        style={{
                                            backgroundColor: `hsl(${selectedHsl.h}, ${selectedHsl.s}%, ${selectedHsl.l}%)`,
                                            left: `${wheelPosition.x - 12}px`,
                                            top: `${wheelPosition.y - 12}px`,
                                            transition: isDragging ? 'none' : 'all 0.2s ease'
                                        }}
                                    />
                                    
                                    {/* Complementary Color Circle */}
                                    <div 
                                        className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg pointer-events-none z-10"
                                        style={{
                                            backgroundColor: `hsl(${complementaryHsl.h}, ${complementaryHsl.s}%, ${complementaryHsl.l}%)`,
                                            left: `${320 - wheelPosition.x - 12}px`,
                                            top: `${320 - wheelPosition.y - 12}px`,
                                            transition: isDragging ? 'none' : 'all 0.2s ease'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Color Information Panel */}
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 min-w-80">
                                <h3 className="text-lg font-semibold mb-4">Color Information</h3>
                                
                                {/* Selected Color */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Color</h4>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div 
                                            className="w-16 h-16 rounded border-2 border-gray-300"
                                            style={{ backgroundColor: `hsl(${selectedHsl.h}, ${selectedHsl.s}%, ${selectedHsl.l}%)` }}
                                        />
                                        <div className="flex-1">
                                            <div className="font-mono text-sm">
                                                {hslToHex(selectedHsl.h, selectedHsl.s, selectedHsl.l)}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {hslToRgb(selectedHsl.h, selectedHsl.s, selectedHsl.l)}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                HSL({Math.round(selectedHsl.h)}°, {Math.round(selectedHsl.s)}%, {Math.round(selectedHsl.l)}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Complementary Color */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Complementary Color</h4>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div 
                                            className="w-16 h-16 rounded border-2 border-gray-300"
                                            style={{ backgroundColor: `hsl(${complementaryHsl.h}, ${complementaryHsl.s}%, ${complementaryHsl.l}%)` }}
                                        />
                                        <div className="flex-1">
                                            <div className="font-mono text-sm">
                                                {hslToHex(complementaryHsl.h, complementaryHsl.s, complementaryHsl.l)}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {hslToRgb(complementaryHsl.h, complementaryHsl.s, complementaryHsl.l)}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                HSL({Math.round(complementaryHsl.h)}°, {Math.round(complementaryHsl.s)}%, {Math.round(complementaryHsl.l)}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Color Harmony Suggestions */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Color Harmonies</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { name: 'Analogous 1', color: hslToHex((selectedHsl.h + 30) % 360, selectedHsl.s, selectedHsl.l) },
                                            { name: 'Analogous 2', color: hslToHex((selectedHsl.h - 30 + 360) % 360, selectedHsl.s, selectedHsl.l) },
                                            { name: 'Triadic 1', color: hslToHex((selectedHsl.h + 120) % 360, selectedHsl.s, selectedHsl.l) },
                                            { name: 'Triadic 2', color: hslToHex((selectedHsl.h + 240) % 360, selectedHsl.s, selectedHsl.l) },
                                            { name: 'Split Comp 1', color: hslToHex((selectedHsl.h + 150) % 360, selectedHsl.s, selectedHsl.l) },
                                            { name: 'Split Comp 2', color: hslToHex((selectedHsl.h + 210) % 360, selectedHsl.s, selectedHsl.l) }
                                        ].map((harmony, index) => (
                                            <div key={index} className="text-center">
                                                <div 
                                                    className="w-full h-12 rounded border border-gray-300 mb-1"
                                                    style={{ backgroundColor: harmony.color }}
                                                    title={harmony.name}
                                                />
                                                <div className="text-xs text-gray-600">{harmony.name}</div>
                                                <div className="text-xs font-mono text-gray-500">{harmony.color}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-800">
                                    <strong>How to use:</strong><br/>
                                    • Click and drag the white circle to select colors<br/>
                                    • The second circle shows the complementary color<br/>
                                    • Color codes update in real-time<br/>
                                    • Try different color harmonies below
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case "tintShade":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Base Color</label>
                            <input
                                type="color"
                                value={colorPicker}
                                onChange={(e) => {
                                    setColorPicker(e.target.value);
                                    const color = e.target.value;
                                    const r = parseInt(color.slice(1, 3), 16);
                                    const g = parseInt(color.slice(3, 5), 16);
                                    const b = parseInt(color.slice(5, 7), 16);
                                    
                                    // Generate tints (lighter)
                                    const tints = [];
                                    for (let i = 1; i <= 3; i++) {
                                        const factor = i * 0.2;
                                        const tintR = Math.round(r + (255 - r) * factor);
                                        const tintG = Math.round(g + (255 - g) * factor);
                                        const tintB = Math.round(b + (255 - b) * factor);
                                        tints.push('#' + [tintR, tintG, tintB].map(x => x.toString(16).padStart(2, '0')).join(''));
                                    }
                                    
                                    // Generate shades (darker)
                                    const shades = [];
                                    for (let i = 1; i <= 3; i++) {
                                        const factor = i * 0.2;
                                        const shadeR = Math.round(r * (1 - factor));
                                        const shadeG = Math.round(g * (1 - factor));
                                        const shadeB = Math.round(b * (1 - factor));
                                        shades.push('#' + [shadeR, shadeG, shadeB].map(x => x.toString(16).padStart(2, '0')).join(''));
                                    }
                                    
                                    setColorScheme([...tints, color, ...shades]);
                                }}
                                className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                            />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-2">Tints (Lighter)</div>
                                <div className="flex gap-2">
                                    {colorScheme.slice(0, 3).map((color, index) => (
                                        <div key={index} className="text-center">
                                            <div 
                                                className="w-16 h-16 rounded border-2 border-gray-300 mb-1"
                                                style={{ backgroundColor: color }}
                                            />
                                            <div className="text-xs font-mono">{color}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2">Original</div>
                                <div className="flex gap-2">
                                    <div className="text-center">
                                        <div 
                                            className="w-16 h-16 rounded border-2 border-gray-300 mb-1"
                                            style={{ backgroundColor: colorPicker }}
                                        />
                                        <div className="text-xs font-mono">{colorPicker}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2">Shades (Darker)</div>
                                <div className="flex gap-2">
                                    {colorScheme.slice(4).map((color, index) => (
                                        <div key={index} className="text-center">
                                            <div 
                                                className="w-16 h-16 rounded border-2 border-gray-300 mb-1"
                                                style={{ backgroundColor: color }}
                                            />
                                            <div className="text-xs font-mono">{color}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case "colorNames":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Color</label>
                            <input
                                type="color"
                                value={colorPicker}
                                onChange={(e) => {
                                    setColorPicker(e.target.value);
                                    // Simple color name mapping
                                    const colorNames = {
                                        '#FF0000': 'Red',
                                        '#00FF00': 'Lime',
                                        '#0000FF': 'Blue',
                                        '#FFFF00': 'Yellow',
                                        '#FF00FF': 'Magenta',
                                        '#00FFFF': 'Cyan',
                                        '#000000': 'Black',
                                        '#FFFFFF': 'White',
                                        '#808080': 'Gray',
                                        '#FFA500': 'Orange',
                                        '#800080': 'Purple',
                                        '#FFC0CB': 'Pink'
                                    };
                                    setColorName(colorNames[e.target.value.toUpperCase()] || 'Unknown color');
                                }}
                                className="w-full h-12 border-2 border-gray-300 rounded cursor-pointer"
                            />
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Color Name:</div>
                            <div className="text-lg font-bold">{colorName}</div>
                            <div className="text-sm text-gray-600 mt-1">Hex: {colorPicker}</div>
                        </div>
                    </motion.div>
                );

            // Math Tools
            case "octalConverter":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Octal Number</label>
                                <Input
                                    value={octalInput}
                                    onChange={(e) => {
                                        setOctalInput(e.target.value);
                                        try {
                                            const decimal = parseInt(e.target.value, 8);
                                            setOctalOutput(decimal.toString());
                                        } catch (error) {
                                            setOctalOutput("Invalid octal");
                                        }
                                    }}
                                    placeholder="123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Decimal</label>
                                <Input
                                    value={octalOutput}
                                    readOnly
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "scientificCalc":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Expression</label>
                                <Input
                                    value={scientificExpression}
                                    onChange={(e) => {
                                        setScientificExpression(e.target.value);
                                        try {
                                            // Simple scientific calculations
                                            const result = Function('"use strict"; return (' + e.target.value + ')')();
                                            setScientificResult(result.toString());
                                        } catch (error) {
                                            setScientificResult("Invalid expression");
                                        }
                                    }}
                                    placeholder="Math.sqrt(16) or Math.pow(2, 3)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Result</label>
                                <Input
                                    value={scientificResult}
                                    readOnly
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "gcdLcm":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Number A</label>
                                <Input
                                    type="number"
                                    value={gcdLcmInput.a}
                                    onChange={(e) => setGcdLcmInput({...gcdLcmInput, a: e.target.value})}
                                    placeholder="12"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Number B</label>
                                <Input
                                    type="number"
                                    value={gcdLcmInput.b}
                                    onChange={(e) => setGcdLcmInput({...gcdLcmInput, b: e.target.value})}
                                    placeholder="18"
                                />
                            </div>
                        </div>
                        <Button onClick={() => {
                            const a = parseInt(gcdLcmInput.a);
                            const b = parseInt(gcdLcmInput.b);
                            if (!isNaN(a) && !isNaN(b)) {
                                const gcd = (x, y) => {
                                    while (y) {
                                        [x, y] = [y, x % y];
                                    }
                                    return x;
                                };
                                const lcm = (a * b) / gcd(a, b);
                                setGcdLcmOutput({ gcd: gcd(a, b).toString(), lcm: lcm.toString() });
                            }
                        }}>
                            Calculate GCD & LCM
                        </Button>
                        {gcdLcmOutput.gcd && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                    <div className="text-sm font-medium mb-1">GCD:</div>
                                    <div className="text-2xl font-bold">{gcdLcmOutput.gcd}</div>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                    <div className="text-sm font-medium mb-1">LCM:</div>
                                    <div className="text-2xl font-bold">{gcdLcmOutput.lcm}</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );

            case "primeNumbers":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Find primes up to:</label>
                            <Input
                                type="number"
                                value={primeInput}
                                onChange={(e) => {
                                    setPrimeInput(e.target.value);
                                    const n = parseInt(e.target.value);
                                    if (!isNaN(n) && n > 1) {
                                        const primes = [];
                                        for (let i = 2; i <= n; i++) {
                                            let isPrime = true;
                                            for (let j = 2; j <= Math.sqrt(i); j++) {
                                                if (i % j === 0) {
                                                    isPrime = false;
                                                    break;
                                                }
                                            }
                                            if (isPrime) primes.push(i);
                                        }
                                        setPrimeOutput(primes);
                                    }
                                }}
                                placeholder="100"
                            />
                        </div>
                        {primeOutput.length > 0 && (
                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                <div className="text-sm font-medium mb-2">Prime Numbers:</div>
                                <div className="text-sm">{primeOutput.join(', ')}</div>
                            </div>
                        )}
                    </motion.div>
                );

            case "factorial":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Number</label>
                                <Input
                                    type="number"
                                    value={factorialInput}
                                    onChange={(e) => {
                                        setFactorialInput(e.target.value);
                                        const n = parseInt(e.target.value);
                                        if (!isNaN(n) && n >= 0 && n <= 20) {
                                            let result = 1;
                                            for (let i = 2; i <= n; i++) {
                                                result *= i;
                                            }
                                            setFactorialOutput(result.toString());
                                        } else {
                                            setFactorialOutput("Invalid input (0-20 only)");
                                        }
                                    }}
                                    placeholder="5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Factorial</label>
                                <Input
                                    value={factorialOutput}
                                    readOnly
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case "statistics":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-2">Numbers (comma-separated)</label>
                            <Textarea
                                value={statsInput}
                                onChange={(e) => {
                                    setStatsInput(e.target.value);
                                    const numbers = e.target.value.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
                                    if (numbers.length > 0) {
                                        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
                                        const sorted = numbers.sort((a, b) => a - b);
                                        const median = sorted.length % 2 === 0 
                                            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                                            : sorted[Math.floor(sorted.length / 2)];
                                        
                                        const frequency = {};
                                        numbers.forEach(n => {
                                            frequency[n] = (frequency[n] || 0) + 1;
                                        });
                                        const mode = Object.keys(frequency).reduce((a, b) => 
                                            frequency[a] > frequency[b] ? a : b
                                        );
                                        
                                        const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
                                        const std = Math.sqrt(variance);
                                        
                                        setStatsOutput({
                                            mean: mean.toFixed(2),
                                            median: median.toFixed(2),
                                            mode: mode,
                                            std: std.toFixed(2)
                                        });
                                    }
                                }}
                                placeholder="1, 2, 3, 4, 5, 5, 6"
                                className="min-h-24"
                            />
                        </div>
                        {statsOutput.mean && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                    <div className="text-sm font-medium mb-1">Mean:</div>
                                    <div className="text-xl font-bold">{statsOutput.mean}</div>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                    <div className="text-sm font-medium mb-1">Median:</div>
                                    <div className="text-xl font-bold">{statsOutput.median}</div>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                    <div className="text-sm font-medium mb-1">Mode:</div>
                                    <div className="text-xl font-bold">{statsOutput.mode}</div>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                    <div className="text-sm font-medium mb-1">Std Dev:</div>
                                    <div className="text-xl font-bold">{statsOutput.std}</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );

            default:
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="text-gray-500">
                            <Settings className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-lg">This tool is coming soon! 🚧</p>
                            <p className="text-sm mt-2">We're working hard to bring you this amazing tool.</p>
                        </div>
                    </motion.div>
                );
        }
    };

    // Helper functions for new tools

    return (
        <motion.div 
            className="min-h-screen py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div 
                    className="mb-12 text-center"
                    variants={itemVariants}
                >
                    <motion.h1 
                        className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Utility Tools
                    </motion.h1>
                    <motion.p 
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        100+ developer tools for productivity with one-click access and immediate results
                    </motion.p>
                </motion.div>

                {/* Tool Categories */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
                    {toolCategories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <motion.div
                                key={category.name}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="group"
                            >
                                <Card className={`h-full cursor-pointer transition-all duration-300 hover:shadow-2xl border-0 bg-gradient-to-br ${category.bgColor} group-hover:scale-105 overflow-hidden`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <CardHeader className="relative">
                                        <motion.div 
                                            className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 shadow-lg`}
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Icon className="h-8 w-8 text-white" />
                                        </motion.div>
                                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                                            {category.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                            {category.tools.map((tool) => (
                                                <Button
                                                    key={tool.name}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setActiveTool(tool.action)}
                                                    className={`w-full justify-start text-left hover:bg-gradient-to-r hover:${category.color} hover:text-white transition-all duration-300 ${
                                                        activeTool === tool.action ? `bg-gradient-to-r ${category.color} text-white` : ""
                                                    }`}
                                                >
                                                    <tool.icon className="h-4 w-4 mr-2" />
                                                    {tool.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Active Tool Interface */}
                <AnimatePresence mode="wait">
                    {activeTool && (
                        <motion.div
                            ref={activeToolRef}
                            key={activeTool}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-cyan-50">
                                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3 text-2xl">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Zap className="h-8 w-8" />
                                            </motion.div>
                                            {toolCategories.find(cat => cat.tools.some(tool => tool.action === activeTool))?.name}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAll}
                                                className="text-white hover:bg-white/20"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setActiveTool(null)}
                                                className="text-white hover:bg-white/20"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {renderToolInterface()}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Access Tools */}
                {!activeTool && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12"
                    >
                        <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <CardTitle className="flex items-center gap-3">
                                    <Zap className="h-6 w-6" />
                                    Quick Access Tools
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {toolCategories.flatMap(cat => cat.tools.slice(0, 4)).map((tool) => {
                                        const category = toolCategories.find(cat => cat.tools.some(t => t.action === tool.action));
                                        const ToolIcon = tool.icon;
                                        return (
                                            <motion.div
                                                key={tool.action}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setActiveTool(tool.action)}
                                                    className={`w-full h-16 flex flex-col gap-1 bg-gradient-to-r ${category?.bgColor} hover:from-white hover:to-gray-50 border-2 hover:border-gray-300 transition-all duration-300`}
                                                >
                                                    <ToolIcon className="h-5 w-5" />
                                                    <span className="text-xs">{tool.name}</span>
                                                </Button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

// Add custom scrollbar styles
const customScrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f5f9;
    }
`;

// Inject styles into document
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = customScrollbarStyles;
    document.head.appendChild(styleSheet);
}