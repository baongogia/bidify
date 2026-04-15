import React, { forwardRef } from 'react';

const CurrencyInput = forwardRef(({ value, onChange, placeholder, className, error, ...props }, ref) => {
    // Helper to format 1000000 -> 1.000.000
    const formatValue = (val) => {
        if (val === undefined || val === null || val === '') return '';
        // Ensure we are working with a string, removing any existing dots
        const cleanVal = String(val).replace(/\./g, '');
        const number = parseFloat(cleanVal);
        if (isNaN(number)) return '';
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const handleChange = (e) => {
        const rawValue = e.target.value;
        // Remove all dots to get the numeric part
        const numericValue = rawValue.replace(/\./g, '');
        
        // Only allow numbers
        if (numericValue === '' || /^\d*$/.test(numericValue)) {
            // Call onChange with the string value (empty) or numeric value
            onChange(numericValue === '' ? '' : numericValue);
        }
    };

    return (
        <div className="relative">
            <input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={formatValue(value)}
                onChange={handleChange}
                placeholder={placeholder}
                className={`${className} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                {...props}
            />
        </div>
    );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
