"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/toast-provider";
import { playCalcSound } from "@/lib/calculator-sound";

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  gstTag?: string;
}

// Safe expression evaluator (Never uses eval())
export function evaluateExpression(expr: string): { result: number | null; error?: string } {
  const sanitized = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").trim();
  if (!sanitized) return { result: 0 };

  const tokens: string[] = [];
  let currentNum = "";

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    if ((char >= "0" && char <= "9") || char === ".") {
      currentNum += char;
    } else if (char === " ") {
      continue;
    } else if (["+", "-", "*", "/", "%"].includes(char)) {
      if (currentNum !== "") {
        tokens.push(currentNum);
        currentNum = "";
      } else if (char === "-" && (tokens.length === 0 || ["+", "-", "*", "/"].includes(tokens[tokens.length - 1]))) {
        currentNum = "-";
        continue;
      }
      tokens.push(char);
    } else {
      return { result: null, error: "Invalid character" };
    }
  }

  if (currentNum !== "") {
    tokens.push(currentNum);
  }

  if (tokens.length === 0) return { result: 0 };

  // Remove trailing operators for live evaluation
  const evalTokens = [...tokens];
  while (evalTokens.length > 0 && ["+", "-", "*", "/"].includes(evalTokens[evalTokens.length - 1])) {
    evalTokens.pop();
  }

  if (evalTokens.length === 0) return { result: 0 };

  // Handle % operations: e.g. "200 + 10 %" -> 10% of 200 = 20
  const processedTokens: string[] = [];
  for (let i = 0; i < evalTokens.length; i++) {
    const token = evalTokens[i];
    if (token === "%") {
      const prev = processedTokens.pop();
      if (prev !== undefined && !isNaN(Number(prev))) {
        const prevNum = Number(prev);
        if (processedTokens.length >= 2) {
          const op = processedTokens[processedTokens.length - 1];
          const base = Number(processedTokens[processedTokens.length - 2]);
          if (["+", "-"].includes(op) && !isNaN(base)) {
            processedTokens.push(((base * prevNum) / 100).toString());
            continue;
          }
        }
        processedTokens.push((prevNum / 100).toString());
      }
    } else {
      processedTokens.push(token);
    }
  }

  // Shunting-yard algorithm
  const outputQueue: (number | string)[] = [];
  const operatorStack: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (const token of processedTokens) {
    if (!isNaN(Number(token))) {
      outputQueue.push(Number(token));
    } else if (token in precedence) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] in precedence &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    }
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop()!);
  }

  // Evaluate postfix
  const evalStack: number[] = [];
  for (const token of outputQueue) {
    if (typeof token === "number") {
      evalStack.push(token);
    } else {
      const b = evalStack.pop();
      const a = evalStack.pop();
      if (a === undefined || b === undefined) return { result: null, error: "Invalid expression" };
      if (token === "/" && b === 0) {
        return { result: null, error: "Cannot divide by 0" };
      }
      let res = 0;
      switch (token) {
        case "+": res = a + b; break;
        case "-": res = a - b; break;
        case "*": res = a * b; break;
        case "/": res = a / b; break;
      }
      evalStack.push(res);
    }
  }

  if (evalStack.length !== 1 || isNaN(evalStack[0]) || !isFinite(evalStack[0])) {
    return { result: null, error: "Invalid calculation" };
  }

  const finalVal = Math.round(evalStack[0] * 100000000) / 100000000;
  return { result: finalVal };
}

export function formatIndianNumber(value: number | null, error?: string): string {
  if (error) return error;
  if (value === null) return "0";
  // Format whole number in en-IN and retain decimals if any
  const parts = value.toString().split(".");
  const intPart = Number(parts[0]);
  const formattedInt = isNaN(intPart) ? parts[0] : intPart.toLocaleString("en-IN");
  return parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
}

export function MobileCalculator() {
  const { showToast } = useToast();

  // Neutral initial state (no hardcoded/preset expression on fresh open or reset)
  const [expression, setExpression] = useState<string>("0");
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);

  // Active GST selection: e.g. { mode: 'add' | 'remove', rate: 12 }
  const [activeGst, setActiveGst] = useState<{ mode: "add" | "remove"; rate: number } | null>(null);

  // Configurable GST rates (defaults: 3, 5, 12, 18, 28)
  const [gstRates, setGstRates] = useState<number[]>([3, 5, 12, 18, 28]);
  const [isEditGstOpen, setIsEditGstOpen] = useState<boolean>(false);
  const [editRateInputs, setEditRateInputs] = useState<string[]>(["3", "5", "12", "18", "28"]);

  // Calculation History View Modal / Tape
  const [isViewHistoryOpen, setIsViewHistoryOpen] = useState<boolean>(false);
  const [historyTape, setHistoryTape] = useState<HistoryItem[]>([]);

  // Load saved history & custom rates from localStorage
  useEffect(() => {
    try {
      const savedTape = localStorage.getItem("calcbuddy_calc_history");
      if (savedTape) {
        setHistoryTape(JSON.parse(savedTape));
      }
      const savedRates = localStorage.getItem("calcbuddy_gst_rates");
      if (savedRates) {
        const parsed = JSON.parse(savedRates);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setGstRates(parsed);
          setEditRateInputs(parsed.map(String));
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Compute live base evaluation
  const baseEval = evaluateExpression(expression);
  let effectiveResultNumber = baseEval.result;
  let effectiveError = baseEval.error;

  // If GST is applied, calculate final result
  if (activeGst && effectiveResultNumber !== null && !effectiveError) {
    if (activeGst.mode === "add") {
      const gst = (effectiveResultNumber * activeGst.rate) / 100;
      effectiveResultNumber = Math.round((effectiveResultNumber + gst) * 100) / 100;
    } else {
      const base = activeGst.rate === -100 ? 0 : effectiveResultNumber / (1 + activeGst.rate / 100);
      effectiveResultNumber = Math.round(base * 100) / 100;
    }
  }

  const formattedResult = formatIndianNumber(effectiveResultNumber, effectiveError);

  // Keypad Handlers with ASMR sound
  const handleDigit = (digit: string) => {
    playCalcSound("number");
    if (hasEvaluated || expression === "0") {
      setExpression(digit);
      setHasEvaluated(false);
      setActiveGst(null);
      return;
    }
    setExpression((prev) => prev + digit);
    setActiveGst(null);
  };

  const handleDoubleZero = () => {
    playCalcSound("number");
    if (hasEvaluated || expression === "0" || expression === "") {
      setExpression("0");
      setHasEvaluated(false);
      setActiveGst(null);
      return;
    }
    setExpression((prev) => prev + "00");
    setActiveGst(null);
  };

  const handleDecimal = () => {
    playCalcSound("number");
    if (hasEvaluated || expression === "0") {
      setExpression("0.");
      setHasEvaluated(false);
      setActiveGst(null);
      return;
    }
    const tokens = expression.split(/[\s+\-×÷/*]+/);
    const lastToken = tokens[tokens.length - 1];
    if (!lastToken.includes(".")) {
      setExpression((prev) => (prev === "" ? "0." : prev + "."));
    }
    setActiveGst(null);
  };

  const handleOperator = (op: "+" | "−" | "×" | "÷") => {
    playCalcSound("operator");
    setHasEvaluated(false);
    setActiveGst(null);
    const trimmed = expression.trim();
    if (!trimmed || trimmed === "0") {
      if (op === "−") {
        setExpression("-");
      } else {
        setExpression("0 " + op + " ");
      }
      return;
    }
    const lastChar = trimmed[trimmed.length - 1];
    if (["+", "−", "×", "÷", "-", "*", "/"].includes(lastChar)) {
      setExpression(trimmed.slice(0, -1).trim() + " " + op + " ");
    } else {
      setExpression(trimmed + " " + op + " ");
    }
  };

  const handlePercent = () => {
    playCalcSound("operator");
    setHasEvaluated(false);
    setActiveGst(null);
    const trimmed = expression.trim();
    if (!trimmed || trimmed === "0") return;
    const lastChar = trimmed[trimmed.length - 1];
    if (!["+", "−", "×", "÷", "%"].includes(lastChar)) {
      setExpression(trimmed + " %");
    }
  };

  const handleBackspace = () => {
    playCalcSound("action");
    setActiveGst(null);
    if (hasEvaluated) {
      setExpression("0");
      setHasEvaluated(false);
      return;
    }
    const trimmed = expression.trimEnd();
    if (trimmed.length <= 1) {
      setExpression("0");
    } else {
      const lastChar = trimmed[trimmed.length - 1];
      if (["+", "−", "×", "÷"].includes(lastChar)) {
        setExpression(trimmed.slice(0, -1).trimEnd());
      } else {
        setExpression(trimmed.slice(0, -1));
      }
    }
  };

  const handleAllClear = () => {
    playCalcSound("action");
    setExpression("0");
    setHasEvaluated(false);
    setActiveGst(null);
  };

  const handleEquals = () => {
    playCalcSound("equals");
    if (effectiveResultNumber !== null && !effectiveError) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expression + (activeGst ? ` (${activeGst.mode === "add" ? "+" : "-"}${activeGst.rate}% GST)` : ""),
        result: formattedResult,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        gstTag: activeGst ? `${activeGst.mode === "add" ? "+" : "-"}${activeGst.rate}%` : undefined,
      };

      setHistoryTape((prev) => {
        const updated = [newItem, ...prev.slice(0, 49)];
        try {
          localStorage.setItem("calcbuddy_calc_history", JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      setExpression(effectiveResultNumber.toString());
      setHasEvaluated(true);
      setActiveGst(null);
    }
  };

  // GST rate toggle handler
  const handleGstRateClick = (mode: "add" | "remove", rate: number) => {
    playCalcSound("gst");
    if (activeGst && activeGst.mode === mode && activeGst.rate === rate) {
      setActiveGst(null);
    } else {
      setActiveGst({ mode, rate });
    }
  };

  // Action Bar Handlers: Copy, Save, View, Edit GST
  const handleCopy = async () => {
    playCalcSound("operator");
    try {
      const textToCopy = `${expression} = ${formattedResult}`;
      await navigator.clipboard.writeText(textToCopy);
      showToast("Copied equation to clipboard!", "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleSave = () => {
    playCalcSound("operator");
    if (effectiveResultNumber === null || effectiveError) {
      showToast("Cannot save invalid calculation", "error");
      return;
    }
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression: expression + (activeGst ? ` (${activeGst.mode === "add" ? "+" : "-"}${activeGst.rate}% GST)` : ""),
      result: formattedResult,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      gstTag: activeGst ? `${activeGst.mode === "add" ? "+" : "-"}${activeGst.rate}%` : undefined,
    };

    setHistoryTape((prev) => {
      const updated = [newItem, ...prev.slice(0, 49)];
      try {
        localStorage.setItem("calcbuddy_calc_history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    showToast("Calculation saved to history!", "success");
  };

  const handleSaveCustomRates = () => {
    playCalcSound("operator");
    const parsed = editRateInputs.map((val) => {
      const num = parseFloat(val);
      return isNaN(num) || num <= 0 ? 0 : num;
    });
    setGstRates(parsed);
    try {
      localStorage.setItem("calcbuddy_gst_rates", JSON.stringify(parsed));
    } catch {
      // ignore
    }
    setIsEditGstOpen(false);
    showToast("GST rates updated!", "success");
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === ".") {
        handleDecimal();
      } else if (e.key === "+") {
        e.preventDefault();
        handleOperator("+");
      } else if (e.key === "-") {
        e.preventDefault();
        handleOperator("−");
      } else if (e.key === "*") {
        e.preventDefault();
        handleOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
      } else if (e.key === "%") {
        e.preventDefault();
        handlePercent();
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape" || e.key.toLowerCase() === "c") {
        handleAllClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="flex h-full w-full flex-col justify-between gap-1.5 sm:gap-2">
      {/* 1. Calculator Display Card */}
      <div className="relative shrink-0 rounded-2xl border border-[#d6ede2] bg-[#f0faf5] p-3 sm:p-3.5 shadow-xs">
        {/* Top-right clear (×) button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAllClear}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-600 transition-colors hover:bg-slate-400 hover:text-white"
            aria-label="Clear display"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Right-aligned expression */}
        <div className="mt-0.5 text-right">
          <div className="inline-flex max-w-full items-center justify-end overflow-x-auto whitespace-nowrap scrollbar-none font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
            <span>{expression}</span>
            <span className="ml-1 inline-block h-6 sm:h-7 w-0.5 animate-pulse bg-[#0fa37f]" />
          </div>
        </div>

        {/* Right-aligned result prefixed with '=' */}
        <div className="mt-0.5 text-right">
          <span className="font-bold text-lg sm:text-xl text-[#009f75] tracking-tight overflow-x-auto block whitespace-nowrap scrollbar-none">
            = {formattedResult}
          </span>
        </div>
      </div>

      {/* 2. Compact Action Row: EDIT GST, COPY, VIEW, SAVE */}
      <div className="grid shrink-0 grid-cols-4 gap-1.5 sm:gap-2">
        {/* EDIT GST */}
        <button
          type="button"
          onClick={() => {
            playCalcSound("operator");
            setIsEditGstOpen(true);
          }}
          className="flex h-9 sm:h-10 items-center justify-center gap-1 rounded-xl border border-[#d6ede2] bg-[#edf9f4] px-1 text-[11px] font-bold text-slate-800 shadow-2xs hover:bg-[#dcf4e9] active:scale-95 transition-all"
        >
          <svg className="h-3.5 w-3.5 text-[#0fa37f] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M11 18l5 -5"/>
            <circle cx="10" cy="14" r="0.8" fill="currentColor"/>
          </svg>
          <span>EDIT GST</span>
        </button>

        {/* COPY */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-9 sm:h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-[#f8fafc] px-1 text-[11px] font-bold text-slate-800 shadow-2xs hover:bg-slate-100 active:scale-95 transition-all"
        >
          <svg className="h-3.5 w-3.5 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>COPY</span>
        </button>

        {/* VIEW */}
        <button
          type="button"
          onClick={() => {
            playCalcSound("operator");
            setIsViewHistoryOpen(true);
          }}
          className="flex h-9 sm:h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-[#f8fafc] px-1 text-[11px] font-bold text-slate-800 shadow-2xs hover:bg-slate-100 active:scale-95 transition-all"
        >
          <svg className="h-3.5 w-3.5 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <circle cx="3.5" cy="6" r="1.2" fill="currentColor"/>
            <circle cx="3.5" cy="12" r="1.2" fill="currentColor"/>
            <circle cx="3.5" cy="18" r="1.2" fill="currentColor"/>
          </svg>
          <span>VIEW</span>
        </button>

        {/* SAVE */}
        <button
          type="button"
          onClick={handleSave}
          className="flex h-9 sm:h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-[#f8fafc] px-1 text-[11px] font-bold text-slate-800 shadow-2xs hover:bg-slate-100 active:scale-95 transition-all"
        >
          <svg className="h-3.5 w-3.5 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>SAVE</span>
        </button>
      </div>

      {/* 3. Two Shortcut Rows above Keypad: Add GST & Remove GST */}
      <div className="shrink-0 space-y-1.5">
        {/* Row 1: Add GST */}
        <div className="flex items-center gap-1.5">
          {/* Fully readable label pill */}
          <div className="flex h-9 sm:h-10 w-[84px] sm:w-[94px] shrink-0 items-center justify-center gap-1 rounded-xl border border-[#d6ede2] bg-[#edf9f4] px-1 text-center font-bold text-[11px] sm:text-xs text-[#0fa37f]">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="whitespace-nowrap">Add GST</span>
          </div>

          {/* 5 GST Rates */}
          {gstRates.map((rate) => {
            const isSelected = activeGst?.mode === "add" && activeGst.rate === rate;
            return (
              <button
                key={`add-${rate}`}
                type="button"
                onClick={() => handleGstRateClick("add", rate)}
                className={`flex-1 flex h-9 sm:h-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#009f75] text-white shadow-xs scale-102"
                    : "border border-slate-200 bg-white text-[#009f75] hover:bg-[#f0faf5] active:scale-95"
                }`}
              >
                +{rate}%
              </button>
            );
          })}
        </div>

        {/* Row 2: Remove GST */}
        <div className="flex items-center gap-1.5">
          {/* Fully readable label pill */}
          <div className="flex h-9 sm:h-10 w-[84px] sm:w-[94px] shrink-0 items-center justify-center gap-1 rounded-xl border border-[#fee2e2] bg-[#fef0f2] px-1 text-center font-bold text-[10.5px] sm:text-xs text-[#d93848]">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="whitespace-nowrap">Remove GST</span>
          </div>

          {/* 5 GST Rates */}
          {gstRates.map((rate) => {
            const isSelected = activeGst?.mode === "remove" && activeGst.rate === rate;
            return (
              <button
                key={`rem-${rate}`}
                type="button"
                onClick={() => handleGstRateClick("remove", rate)}
                className={`flex-1 flex h-9 sm:h-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#d93848] text-white shadow-xs scale-102"
                    : "border border-slate-200 bg-white text-[#d93848] hover:bg-[#fff5f5] active:scale-95"
                }`}
              >
                −{rate}%
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Keypad: 4 columns x 5 rows filling the remaining height proportionally */}
      <div className="grid flex-1 min-h-0 grid-cols-4 grid-rows-5 gap-1.5 sm:gap-2 py-0.5">
        {/* Row 1: AC, ⌫, %, ÷ */}
        <button
          type="button"
          onClick={handleAllClear}
          className="h-full min-h-[44px] rounded-2xl border border-[#fee2e2] bg-[#fdf0f2] text-xl font-bold text-[#b91c1c] shadow-xs hover:bg-[#fcd4da] active:scale-95 transition-all flex items-center justify-center"
        >
          AC
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-full min-h-[44px] rounded-2xl border border-slate-200 bg-[#f8fafc] text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Backspace"
        >
          <svg className="h-6 w-6 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
            <line x1="18" y1="9" x2="12" y2="15"/>
            <line x1="12" y1="9" x2="18" y2="15"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={handlePercent}
          className="h-full min-h-[44px] rounded-2xl border border-slate-200 bg-[#f8fafc] text-2xl font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => handleOperator("÷")}
          className="h-full min-h-[44px] rounded-2xl border border-[#d6ede2] bg-[#edf9f4] text-2xl sm:text-3xl font-bold text-[#0fa37f] shadow-xs hover:bg-[#dcf4e9] active:scale-95 transition-all flex items-center justify-center"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, × */}
        <button
          type="button"
          onClick={() => handleDigit("7")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleDigit("8")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleDigit("9")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleOperator("×")}
          className="h-full min-h-[44px] rounded-2xl border border-[#d6ede2] bg-[#edf9f4] text-2xl sm:text-3xl font-bold text-[#0fa37f] shadow-xs hover:bg-[#dcf4e9] active:scale-95 transition-all flex items-center justify-center"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, − */}
        <button
          type="button"
          onClick={() => handleDigit("4")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleDigit("5")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleDigit("6")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleOperator("−")}
          className="h-full min-h-[44px] rounded-2xl border border-[#d6ede2] bg-[#edf9f4] text-2xl sm:text-3xl font-bold text-[#0fa37f] shadow-xs hover:bg-[#dcf4e9] active:scale-95 transition-all flex items-center justify-center"
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, + */}
        <button
          type="button"
          onClick={() => handleDigit("1")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleDigit("2")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleDigit("3")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleOperator("+")}
          className="h-full min-h-[44px] rounded-2xl border border-[#d6ede2] bg-[#edf9f4] text-2xl sm:text-3xl font-bold text-[#0fa37f] shadow-xs hover:bg-[#dcf4e9] active:scale-95 transition-all flex items-center justify-center"
        >
          +
        </button>

        {/* Row 5: 00, 0, ., = */}
        <button
          type="button"
          onClick={handleDoubleZero}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => handleDigit("0")}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-2xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDecimal}
          className="h-full min-h-[44px] rounded-2xl border border-slate-100 bg-white text-3xl font-bold text-slate-900 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="h-full min-h-[44px] rounded-2xl bg-[#009f75] text-2xl sm:text-3xl font-bold text-white shadow-sm hover:bg-[#008f69] active:scale-95 transition-all flex items-center justify-center"
        >
          =
        </button>
      </div>

      {/* Edit GST Rates Modal */}
      {isEditGstOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#0fa37f]">✎</span> Customize GST Rates
              </h3>
              <button
                type="button"
                onClick={() => setIsEditGstOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Configure the 5 shortcut rates shown above the keypad:
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {editRateInputs.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">#{idx + 1}</span>
                  <div className="flex items-center rounded-xl border border-slate-200 px-1 py-1.5 focus-within:border-[#009f75]">
                    <input
                      type="number"
                      step="any"
                      value={val}
                      onChange={(e) => {
                        const copy = [...editRateInputs];
                        copy[idx] = e.target.value;
                        setEditRateInputs(copy);
                      }}
                      className="w-full text-center text-xs font-bold text-slate-900 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditRateInputs(["3", "5", "12", "18", "28"]);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={handleSaveCustomRates}
                className="flex-1 rounded-xl bg-[#009f75] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#008f69]"
              >
                Save Rates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Calculation History Modal / Tape */}
      {isViewHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[80vh] rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>◷</span> Calculation History
              </h3>
              <div className="flex items-center gap-2">
                {historyTape.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryTape([]);
                      localStorage.removeItem("calcbuddy_calc_history");
                      showToast("History cleared", "info");
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsViewHistoryOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              {historyTape.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No calculations saved yet. Press &quot;SAVE&quot; or &quot;=&quot; to record equations.
                </div>
              ) : (
                historyTape.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setExpression(item.expression.split("(")[0].trim());
                      setIsViewHistoryOpen(false);
                      showToast("Loaded to calculator", "info");
                    }}
                    className="cursor-pointer rounded-2xl border border-slate-100 bg-[#f8fafc] p-3 transition-colors hover:bg-[#f0faf5] hover:border-[#d6ede2]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.timestamp}</span>
                      {item.gstTag && (
                        <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                          {item.gstTag} GST
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-600 overflow-x-auto whitespace-nowrap">
                      {item.expression}
                    </div>
                    <div className="mt-0.5 text-right font-mono text-base font-extrabold text-[#009f75]">
                      = {item.result}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsViewHistoryOpen(false)}
                className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
