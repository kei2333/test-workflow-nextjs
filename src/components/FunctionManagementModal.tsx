import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FunctionData, FunctionInput, FunctionFormData } from '@/types/workflow';
import { validateForm, functionValidationRules, sanitizeInput } from '@/utils/validation';

interface FunctionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (functionData: FunctionData) => Promise<boolean>;
  editingFunction: FunctionData | null;
  mode: 'add' | 'edit';
}

export const FunctionManagementModal: React.FC<FunctionManagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFunction,
  mode
}) => {
  const [formData, setFormData] = useState<FunctionFormData>({
    id: '',
    name: '',
    description: '',
    numberOfInputs: 0
  });
  const [functionInputs, setFunctionInputs] = useState<FunctionInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingFunction) {
        setFormData({
          id: editingFunction.id,
          name: editingFunction.name,
          description: editingFunction.description,
          numberOfInputs: editingFunction.inputs.length
        });
        setFunctionInputs([...editingFunction.inputs]);
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, mode, editingFunction]);

  const resetForm = () => {
    setFormData({ id: '', name: '', description: '', numberOfInputs: 0 });
    setFunctionInputs([]);
    setErrors({});
  };

  const handleInputCountChange = (count: number) => {
    const newCount = Math.max(0, Math.min(20, count)); // Limit between 0 and 20
    const newInputs = [...functionInputs];
    
    if (newCount > functionInputs.length) {
      for (let i = functionInputs.length; i < newCount; i++) {
        newInputs.push({ name: '', placeholder: '' });
      }
    } else if (newCount < functionInputs.length) {
      newInputs.splice(newCount);
    }
    
    setFunctionInputs(newInputs);
    setFormData(prev => ({ ...prev, numberOfInputs: newCount }));
  };

  const updateFunctionInput = (index: number, field: 'name' | 'placeholder', value: string) => {
    const sanitizedValue = sanitizeInput(value);
    const newInputs = [...functionInputs];
    newInputs[index][field] = sanitizedValue;
    setFunctionInputs(newInputs);
  };

  const validateData = (): boolean => {
    const formValidationData = {
      id: formData.id,
      name: formData.name,
      description: formData.description
    };

    const formErrors = validateForm(formValidationData, functionValidationRules);
    const newErrors: Record<string, string> = {};

    formErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Validate function inputs
    functionInputs.forEach((input, index) => {
      if (!input.name.trim()) {
        newErrors[`input-${index}-name`] = `Input field ${index + 1} name is required`;
      }
      if (!input.placeholder.trim()) {
        newErrors[`input-${index}-placeholder`] = `Input field ${index + 1} placeholder is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateData()) {
      return;
    }

    setIsSubmitting(true);
    
    const functionData: FunctionData = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      inputs: functionInputs.map(input => ({
        name: input.name.trim(),
        placeholder: input.placeholder.trim()
      }))
    };

    try {
      const success = await onSave(functionData);
      if (success) {
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFormFieldChange = (field: keyof FunctionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'edit' ? 'Edit Function' : 'Add New Function'}
      size="lg"
    >
      <div onKeyDown={handleKeyDown}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="function-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Function Name *
              </label>
              <input
                id="function-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleFormFieldChange('name', sanitizeInput(e.target.value))}
                placeholder="MyFunction"
                className={`
                  w-full px-4 py-3 border-2 rounded-xl transition-colors focus:outline-none
                  text-gray-900 placeholder:text-gray-500 bg-white
                  ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-400'}
                `}
                maxLength={100}
                aria-describedby={errors.name ? 'name-error' : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p id="name-error" className="text-red-700 text-sm mt-1 font-medium" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="function-id" className="block text-sm font-semibold text-gray-700 mb-2">
                Function ID *
              </label>
              <input
                id="function-id"
                type="text"
                value={formData.id}
                onChange={(e) => handleFormFieldChange('id', sanitizeInput(e.target.value.toLowerCase()))}
                placeholder="myfunction"
                disabled={mode === 'edit'}
                className={`
                  w-full px-4 py-3 border-2 rounded-xl transition-colors focus:outline-none
                  ${mode === 'edit' ? 'bg-gray-100 text-gray-500' : ''}
                  text-gray-900 placeholder:text-gray-500 bg-white
                  ${errors.id ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-400'}
                `}
                maxLength={50}
                aria-describedby={errors.id ? 'id-error' : undefined}
                aria-invalid={!!errors.id}
              />
              {errors.id && (
                <p id="id-error" className="text-red-700 text-sm mt-1 font-medium" role="alert">
                  {errors.id}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="function-description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              id="function-description"
              type="text"
              value={formData.description}
              onChange={(e) => handleFormFieldChange('description', sanitizeInput(e.target.value))}
              placeholder="Function description"
              className={`
                w-full px-4 py-3 border-2 rounded-xl transition-colors focus:outline-none
                text-gray-900 placeholder:text-gray-500 bg-white
                ${errors.description ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-400'}
              `}
              maxLength={500}
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p id="description-error" className="text-red-700 text-sm mt-1 font-medium" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="input-count" className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Input Fields
            </label>
            <input
              id="input-count"
              type="number"
              value={formData.numberOfInputs}
              onChange={(e) => handleInputCountChange(parseInt(e.target.value) || 0)}
              min="0"
              max="20"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
            />
          </div>

          {functionInputs.map((input, index) => (
            <div key={index} className="border-2 border-gray-100 rounded-xl p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Input Field {index + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`input-${index}-name`} className="block text-sm font-medium text-gray-600 mb-1">
                    Field Name *
                  </label>
                  <input
                    id={`input-${index}-name`}
                    type="text"
                    value={input.name}
                    onChange={(e) => updateFunctionInput(index, 'name', e.target.value)}
                    placeholder="Field name"
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors
                      text-gray-900 placeholder:text-gray-500 bg-white
                      ${errors[`input-${index}-name`] ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-400'}
                    `}
                    maxLength={100}
                    aria-invalid={!!errors[`input-${index}-name`]}
                  />
                  {errors[`input-${index}-name`] && (
                    <p className="text-red-700 text-sm mt-1 font-medium" role="alert">
                      {errors[`input-${index}-name`]}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={`input-${index}-placeholder`} className="block text-sm font-medium text-gray-600 mb-1">
                    Placeholder *
                  </label>
                  <input
                    id={`input-${index}-placeholder`}
                    type="text"
                    value={input.placeholder}
                    onChange={(e) => updateFunctionInput(index, 'placeholder', e.target.value)}
                    placeholder="Placeholder text"
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors
                      text-gray-900 placeholder:text-gray-500 bg-white
                      ${errors[`input-${index}-placeholder`] ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-400'}
                    `}
                    maxLength={200}
                    aria-invalid={!!errors[`input-${index}-placeholder`]}
                  />
                  {errors[`input-${index}-placeholder`] && (
                    <p className="text-red-700 text-sm mt-1 font-medium" role="alert">
                      {errors[`input-${index}-placeholder`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-50 bg-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`
              flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all transform 
              focus:outline-none focus:ring-2 focus:ring-offset-1
              ${mode === 'edit' 
                ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 focus:ring-blue-400 shadow-lg' 
                : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 focus:ring-blue-400 shadow-lg'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              mode === 'edit' ? 'Update Function' : 'Add Function'
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Tip: Press Ctrl+Enter to quickly save the function
        </p>
      </div>
    </Modal>
  );
};