"use client";

import { useEffect, useState } from "react";

export function BusinessCalculator() {
  const [display, setDisplay] = useState<string>("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
      case "*":
        return a * b;
      case "÷":
      case "/":
        return b === 0 ? 0 : a / b;
      default:
        return b;
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      const rounded = Math.round(result * 10000) / 10000;
      setDisplay(String(rounded));
      setPrevValue(rounded);
      setHistory((prev) => [`${prevValue} ${operator} ${inputValue} = ${rounded}`, ...prev.slice(0, 9)]);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      const result = calculate(prevValue, inputValue, operator);
      const rounded = Math.round(result * 10000) / 10000;
      setHistory((prev) => [`${prevValue} ${operator} ${inputValue} = ${rounded}`, ...prev.slice(0, 9)]);
      setDisplay(String(rounded));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    if (current === 0) return;
    const value = current / 100;
    setDisplay(String(value));
  };

  // GST shortcuts
  const applyGST = (percentage: number) => {
    const current = parseFloat(display);
    if (isNaN(current)) return;
    const gstAmount = (current * percentage) / 100;
    const totalWithGST = Math.round((current + gstAmount) * 100) / 100;
    setHistory((prev) => [
      `${current} + ${percentage}% GST (${gstAmount.toFixed(2)}) = ${totalWithGST}`,
      ...prev.slice(0, 9),
    ]);
    setDisplay(String(totalWithGST));
    setWaitingForOperand(true);
  };

  const removeGST = (percentage: number) => {
    const current = parseFloat(display);
    if (isNaN(current) || current <= 0) return;
    // Base amount = Total / (1 + rate)
    const base = Math.round((current / (1 + percentage / 100)) * 100) / 100;
    const gstPart = Math.round((current - base) * 100) / 100;
    setHistory((prev) => [
      `${current} - ${percentage}% GST = Base: ${base} (GST: ${gstPart})`,
      ...prev.slice(0, 9),
    ]);
    setDisplay(String(base));
    setWaitingForOperand(true);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "+") {
        performOperation("+");
      } else if (e.key === "-") {
        performOperation("-");
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "Escape") {
        clearAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Business Calculator</h1>
        <p className="text-sm text-slate-600">
          Fast calculation with instant GST additions and tax reverse lookup
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Calculator Body */}
        <div className="md:col-span-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-lg">
          {/* Display */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-right text-white shadow-inner">
            <div className="h-5 text-xs font-mono text-slate-400">
              {prevValue !== null && operator ? `${prevValue} ${operator}` : ""}
            </div>
            <div className="mt-1 font-mono text-3xl sm:text-4xl font-extrabold tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none">
              {display}
            </div>
          </div>

          {/* Quick GST Row */}
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              GST Quick Tax
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => applyGST(5)}
                className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100"
              >
                +5%
              </button>
              <button
                type="button"
                onClick={() => applyGST(12)}
                className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100"
              >
                +12%
              </button>
              <button
                type="button"
                onClick={() => applyGST(18)}
                className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100"
              >
                +18%
              </button>
              <button
                type="button"
                onClick={() => applyGST(28)}
                className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100"
              >
                +28%
              </button>
              <button
                type="button"
                onClick={() => removeGST(18)}
                className="rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-extrabold text-amber-800 hover:bg-amber-100"
                title="Extract base price before 18% GST"
              >
                -18% Base
              </button>
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
            {/* Row 1 */}
            <button
              type="button"
              onClick={clearAll}
              className="h-14 rounded-2xl border border-red-200 bg-red-50 text-base font-bold text-red-700 hover:bg-red-100 active:scale-95"
            >
              C
            </button>
            <button
              type="button"
              onClick={backspace}
              className="h-14 rounded-2xl border border-slate-200 bg-slate-100 text-base font-bold text-slate-700 hover:bg-slate-200 active:scale-95"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={handlePercent}
              className="h-14 rounded-2xl border border-slate-200 bg-slate-100 text-base font-bold text-slate-700 hover:bg-slate-200 active:scale-95"
            >
              %
            </button>
            <button
              type="button"
              onClick={() => performOperation("÷")}
              className="h-14 rounded-2xl border border-brand-200 bg-brand-50 text-xl font-bold text-brand-700 hover:bg-brand-100 active:scale-95"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              type="button"
              onClick={() => inputDigit("7")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => inputDigit("8")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => inputDigit("9")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => performOperation("×")}
              className="h-14 rounded-2xl border border-brand-200 bg-brand-50 text-xl font-bold text-brand-700 hover:bg-brand-100 active:scale-95"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              type="button"
              onClick={() => inputDigit("4")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => inputDigit("5")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => inputDigit("6")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => performOperation("-")}
              className="h-14 rounded-2xl border border-brand-200 bg-brand-50 text-xl font-bold text-brand-700 hover:bg-brand-100 active:scale-95"
            >
              -
            </button>

            {/* Row 4 */}
            <button
              type="button"
              onClick={() => inputDigit("1")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => inputDigit("2")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => inputDigit("3")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => performOperation("+")}
              className="h-14 rounded-2xl border border-brand-200 bg-brand-50 text-xl font-bold text-brand-700 hover:bg-brand-100 active:scale-95"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              type="button"
              onClick={() => inputDigit("0")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => inputDigit("00")}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-lg font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              00
            </button>
            <button
              type="button"
              onClick={inputDecimal}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-xl font-bold text-slate-900 hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              .
            </button>
            <button
              type="button"
              onClick={handleEquals}
              className="h-14 rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-md hover:bg-brand-700 active:scale-95"
            >
              =
            </button>
          </div>
        </div>

        {/* History Tape Sidebar */}
        <div className="md:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Calculation Tape
            </h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
              >
                Clear Tape
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {history.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Calculations will appear here like a printed register tape.
              </p>
            ) : (
              history.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-50 p-2.5 font-mono text-xs text-slate-700 border border-slate-100"
                >
                  {step}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

