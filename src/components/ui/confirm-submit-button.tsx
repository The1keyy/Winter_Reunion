"use client";

interface ConfirmSubmitButtonProps {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A form submit button that requires a native confirm() before the form
 * actually submits. Use for destructive actions (delete, etc.) where a
 * misclick shouldn't be able to trigger the server action.
 */
export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
