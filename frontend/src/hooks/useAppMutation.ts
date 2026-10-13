import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";

export interface MutationOptions<TData, TResult = any> {
  mutationFn: (data: TData) => Promise<TResult>;
  invalidateKeys?: readonly (readonly unknown[])[];
  successMessage?: string | ((result: TResult) => string);
  errorMessage?: string;
  onSuccess?: (result: TResult, variables: TData) => void;
  onError?: (error: any, variables: TData) => void;
}

export function useAppMutation<TData, TResult = any>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: MutationOptions<TData, TResult>) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (result: TResult, variables: TData) => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (successMessage) {
        const message = typeof successMessage === "function" ? successMessage(result) : successMessage;
        toast.success(message);
      }

      if (onSuccess) {
        onSuccess(result, variables);
      }
    },
    onError: (error: any, variables: TData) => {
      const message =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        errorMessage ||
        "Something went wrong";

      toast.error(message);

      if (onError) {
        onError(error, variables);
      }
    },
  });
}
