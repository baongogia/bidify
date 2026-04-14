import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder, disabled, className, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 text-left bg-white border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
        } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
          {selectedOption ? selectedOption.label : (placeholder || '-- Chọn --')}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-1">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">Không có dữ liệu</li>
            ) : (
              options.map((opt, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between hover:bg-gray-50 transition ${
                    String(opt.value) === String(value) ? 'bg-blue-50/50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {String(opt.value) === String(value) && <Check size={16} className="text-blue-600 flex-shrink-0" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
