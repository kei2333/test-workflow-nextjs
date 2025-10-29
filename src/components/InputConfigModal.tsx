import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FunctionData } from '@/types/workflow';
import { sanitizeInput } from '@/utils/validation';

interface InputConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputs: Record<string, string>) => void;
  functionData: FunctionData | null;
  initialValues?: Record<string, string>; // For editing existing items
}

export const InputConfigModal: React.FC<InputConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  functionData,
  initialValues
}) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resolveDefaultValue = (input: FunctionData['inputs'][number]): string => {
    // Check if defaultValue exists and return it
    if ('defaultValue' in input && input.defaultValue) {
      return input.defaultValue;
    }

    if (input.type === 'radio' && input.options && input.options.length > 0) {
      const latestOption = input.options.find(option => option.value === 'latest');
      if (latestOption) {
        return latestOption.value;
      }
      return input.options[0].value;
    }
    return input.placeholder || '';
  };

  useEffect(() => {
    if (functionData) {
      // If initialValues provided (editing mode), use them
      if (initialValues) {
        setInputValues(initialValues);
        return;
      }

      // Initialize input values from environment variables or placeholders
      const initialInputs: Record<string, string> = {};

      if (functionData.id === 'logonispf') {
        functionData.inputs.forEach(input => {
          switch (input.name) {
            case 'Host':
              initialInputs[input.name] = process.env.NEXT_PUBLIC_MAINFRAME_HOST || input.placeholder || '';
              break;
            case 'Port':
              initialInputs[input.name] = process.env.NEXT_PUBLIC_MAINFRAME_PORT || input.placeholder || '';
              break;
            case 'Login Type':
              initialInputs[input.name] = process.env.NEXT_PUBLIC_MAINFRAME_LOGIN_TYPE || resolveDefaultValue(input);
              break;
            case 'User Name':
              initialInputs[input.name] = process.env.NEXT_PUBLIC_MAINFRAME_USERNAME || input.placeholder || '';
              break;
            case 'Password':
              initialInputs[input.name] = process.env.NEXT_PUBLIC_MAINFRAME_PASSWORD || input.placeholder || '';
              break;
            default:
              initialInputs[input.name] = resolveDefaultValue(input);
          }
        });
      } else if (functionData.id === 'getfile') {
        functionData.inputs.forEach(input => {
          switch (input.name) {
            case 'Mainframe File Name':
              initialInputs[input.name] = process.env.NEXT_PUBLIC_MAINFRAME_TEST_FILE || input.placeholder || '';
              break;
            default:
              initialInputs[input.name] = resolveDefaultValue(input);
          }
        });
      } else {
        // For other functions, use placeholders
        functionData.inputs.forEach(input => {
          initialInputs[input.name] = resolveDefaultValue(input);
        });
      }

      setInputValues(initialInputs);
      setErrors({});
    }
  }, [functionData, initialValues]);

  const getJobIdMode = () => {
    const rawValue = inputValues['Use Latest Job ID'] || '';
    return rawValue.toLowerCase() || 'latest';
  };

  const shouldHideJobIdentifier = () => getJobIdMode() !== 'custom';

  const shouldHidePollingControls = () => {
    if (!functionData) {
      return false;
    }
    const pollingFunctions = ['executioncheck', 'getjoblog'];
    return pollingFunctions.includes(functionData.id) && shouldHideJobIdentifier();
  };

  const handleInputChange = (inputName: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setInputValues(prev => {
      const updated: Record<string, string> = {
        ...prev,
        [inputName]: sanitizedValue
      };

      if (inputName === 'Use Latest Job ID') {
        const mode = sanitizedValue.toLowerCase() || 'latest';
        if (mode !== 'custom') {
          delete updated['Job Identifier'];
          delete updated['Max Attempts'];
          delete updated['Poll Interval Seconds'];
        } else {
          functionData?.inputs.forEach(input => {
            if (input.name === 'Max Attempts' || input.name === 'Poll Interval Seconds') {
              if (!updated[input.name]) {
                updated[input.name] = resolveDefaultValue(input);
              }
            }
          });
        }
      }

      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[inputName]) {
      setErrors(prev => ({
        ...prev,
        [inputName]: ''
      }));
    }

    if (inputName === 'Use Latest Job ID') {
      const mode = (sanitizedValue.toLowerCase() || 'latest');
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors['Job Identifier'];
        delete updatedErrors['Max Attempts'];
        delete updatedErrors['Poll Interval Seconds'];
        return updatedErrors;
      });

      if (mode === 'custom') {
        setInputValues(prevValues => {
          const updated = { ...prevValues };
          functionData?.inputs.forEach(input => {
            if ((input.name === 'Max Attempts' || input.name === 'Poll Interval Seconds') && !updated[input.name]) {
              updated[input.name] = resolveDefaultValue(input);
            }
          });
          return updated;
        });
      }
    }
  };

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (functionData) {
      const jobIdMode = getJobIdMode();
      functionData.inputs.forEach(input => {
        const value = inputValues[input.name]?.trim() || '';
        
        if (input.name === 'Job Identifier' && jobIdMode !== 'custom') {
          return;
        }

        if (shouldHidePollingControls() && (input.name === 'Max Attempts' || input.name === 'Poll Interval Seconds')) {
          return;
        }

        // Basic validation - you can extend this
        if (value.length === 0) {
          newErrors[input.name] = `${input.name} cannot be empty`;
          isValid = false;
        } else if (value.length > 500) {
          newErrors[input.name] = `${input.name} is too long (max 500 characters)`;
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirm = () => {
    if (validateInputs()) {
      onConfirm(inputValues);
      handleClose();
    }
  };

  const handleClose = () => {
    setInputValues({});
    setErrors({});
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  if (!functionData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Configure ${functionData.name}`}
      size="md"
    >
      <div onKeyDown={handleKeyDown}>
        <p className="text-base text-gray-600 text-center mb-8 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white/40">{functionData.description}</p>
        
        {functionData.inputs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>This function requires no input parameters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {functionData.inputs.map((input, index) => {
              const jobIdMode = getJobIdMode();
              if (input.name === 'Job Identifier' && jobIdMode !== 'custom') {
                return null;
              }

              if (shouldHidePollingControls() && (input.name === 'Max Attempts' || input.name === 'Poll Interval Seconds')) {
                return null;
              }

              return (
              <div key={`${input.name}-${index}`} className="space-y-2">
                <label
                  htmlFor={`input-${index}`}
                  className="block text-base font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                >
                  {input.name}
                  {input.name.toLowerCase().includes('required') && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {input.type === 'radio' && input.options ? (
                  <div className="flex gap-4">
                    {input.options.map((option, optionIndex) => (
                      <label
                        key={`${input.name}-option-${optionIndex}`}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={input.name}
                          value={option.value}
                          checked={inputValues[input.name] === option.value}
                          onChange={(e) => handleInputChange(input.name, e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          <strong>{option.label}</strong>
                          {option.description && ` - ${option.description}`}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    id={`input-${index}`}
                    type={input.name.toLowerCase().includes('password') ? 'password' : 'text'}
                    value={inputValues[input.name] || ''}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    placeholder={input.placeholder}
                    className={`
                      w-full px-4 py-3 border-2 rounded-xl transition-all duration-200
                      focus:outline-none focus:scale-[1.02] text-gray-900 placeholder:text-gray-500
                      ${errors[input.name]
                        ? 'border-red-400 focus:border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-300 focus:border-blue-400 hover:border-cyan-300 bg-white'
                      }
                    `}
                    maxLength={500}
                    aria-describedby={errors[input.name] ? `error-${index}` : undefined}
                    aria-invalid={!!errors[input.name]}
                  />
                )}

                {errors[input.name] && (
                  <p
                    id={`error-${index}`}
                    className="text-red-700 text-sm mt-1 font-medium"
                    role="alert"
                  >
                    {errors[input.name]}
                  </p>
                )}
              </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border-2 border-white/40 text-gray-700 rounded-xl font-semibold hover:bg-white/60 backdrop-blur-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
          >
            Add Function
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Tip: Press Ctrl+Enter to quickly add the function
        </p>
      </div>
    </Modal>
  );
};