import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * ModeledSelect - A clean, modeled custom dropdown component replacing standard browser selects.
 * 
 * Props:
 * - label: optional small label shown above or inline (e.g., "Status:")
 * - value: currently selected value
 * - onChange: callback(value)
 * - options: array of { value, label, dotColor, icon } or strings
 * - placeholder: fallback string when no selection
 * - icon: optional Lucide icon for trigger
 * - minWidth: string (default: '160px')
 * - align: 'left' | 'right'
 */
export function ModeledSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  icon: TriggerIcon,
  minWidth = '160px',
  align = 'left',
  height,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to object format
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const isFullWidth = minWidth === '100%';

  return (
    <div
      ref={containerRef}
      style={{
        display: isFullWidth ? 'flex' : 'inline-flex',
        width: isFullWidth ? '100%' : 'auto',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {label && (
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}

      {/* Modeled Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          minWidth: minWidth,
          width: isFullWidth ? '100%' : 'auto',
          height: height || '42px',
          boxSizing: 'border-box',
          background: '#ffffff',
          border: isOpen ? '1.5px solid var(--rama-green)' : '1.5px solid #e2e8f0',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(13, 148, 136, 0.15), 0 2px 5px rgba(0,0,0,0.04)'
            : 'none',
          borderRadius: '10px',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          color: 'var(--peacock-deep)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--rama-green)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(13, 148, 136, 0.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {TriggerIcon && <TriggerIcon size={14} color="var(--rama-green)" />}
          {selectedOption.dotColor && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: selectedOption.dotColor,
                flexShrink: 0,
                boxShadow: `0 0 0 2px rgba(255,255,255,0.8)`,
              }}
            />
          )}
          <span
            style={{
              fontSize: '0.80rem',
              fontWeight: 600,
              color: 'var(--peacock-deep)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {selectedOption.label}
          </span>
        </div>

        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Modeled Popover Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align === 'right' ? 'right' : 'left']: label ? 'auto' : 0,
            ...(label && { right: align === 'right' ? 0 : 'auto' }),
            minWidth: isFullWidth ? '100%' : `max(100%, ${minWidth})`,
            width: isFullWidth ? '100%' : 'auto',
            maxWidth: '320px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 12px 28px -4px rgba(0, 50, 70, 0.15), 0 4px 10px -2px rgba(0, 50, 70, 0.06)',
            padding: '4px',
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 9px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--peacock-deep)' : 'var(--text-primary)',
                  background: isSelected ? '#e6f9f5' : 'transparent',
                  transition: 'background 0.12s ease',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#f0fdfa';
                    e.currentTarget.style.color = '#0f766e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
                  {opt.dotColor && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: opt.dotColor,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {opt.icon && <opt.icon size={13} color="var(--rama-green)" />}
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {opt.label}
                  </span>
                </div>

                {isSelected && (
                  <Check size={13} color="var(--rama-green)" style={{ flexShrink: 0, marginLeft: '6px' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
