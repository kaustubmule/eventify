import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import qs from "query-string";

import { UrlQueryParams, RemoveUrlQueryParams } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString: Date) => {
  // Create date object and format directly with IST timezone
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata', // This handles the timezone conversion
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    ...options,
    hour: 'numeric',
    minute: 'numeric',
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    ...options,
    hour: undefined,
    minute: undefined,
    hour12: undefined,
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    ...options,
    weekday: undefined,
    month: undefined,
    day: undefined,
    year: undefined,
  };

  const formattedDateTime = date.toLocaleString('en-IN', dateTimeOptions);
  const formattedDate = date.toLocaleString('en-IN', dateOptions);
  const formattedTime = date.toLocaleString('en-IN', timeOptions);

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const formatPrice = (price: string) => {
  const amount = parseFloat(price);
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return formattedPrice;
};

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function removeKeysFromQuery({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

/**
 * Handles errors by logging them and throwing a consistent error format
 * @param error - The error to handle
 * @param context - Additional context about where the error occurred
 */
export const handleError = (error: unknown, context: string = '') => {
  console.error(`[Error${context ? ` in ${context}` : ''}]`, error);
  
  // Handle different error types
  if (error instanceof Error) {
    // For Error objects, include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    throw error; // Re-throw the original error to preserve stack trace
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    throw new Error(error);
  }
  
  // Handle objects with a message property
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error(String(error.message));
  }
  
  // Handle any other error type
  const errorMessage = 'An unknown error occurred' + (context ? ` in ${context}` : '');
  console.error('Unhandled error type:', typeof error, error);
  throw new Error(errorMessage);
};
