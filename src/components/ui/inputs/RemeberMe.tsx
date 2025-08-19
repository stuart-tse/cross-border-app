'use client';

interface Props {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function RememberMe({ checked, onChange, disabled }: Props) {
    return (
        <label className="flex items-center space-x-2 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
            />
            <span className="text-sm text-gray-600">Remember me</span>
        </label>
    );
}