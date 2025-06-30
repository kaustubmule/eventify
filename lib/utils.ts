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
  
  return formattedPrice.replace('₹', '₹ '); // Add space after Rupee symbol for better readability

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

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};
