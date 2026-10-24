import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Enter password',
  autoComplete = 'current-password',
  required = false,
  className = ''
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-base ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default PasswordInput;
