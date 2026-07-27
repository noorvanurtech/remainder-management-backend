/**
 * Converts a numeric amount to English words in Indian numbering system (Rupees).
 * E.g. 22400 -> "INR Twenty Two Thousand Four Hundred Only"
 */
export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'INR Zero Only';
  }

  const num = Math.floor(Math.abs(amount));
  const decimal = Math.round((Math.abs(amount) - num) * 100);

  if (num === 0 && decimal === 0) {
    return 'INR Zero Only';
  }

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return singleDigits[n];
    const tenDigit = Math.floor(n / 10);
    const unitDigit = n % 10;
    return `${tens[tenDigit]}${unitDigit ? ' ' + singleDigits[unitDigit] : ''}`;
  }

  function convertNumber(n: number): string {
    if (n === 0) return '';

    if (n < 100) {
      return convertTwoDigits(n);
    }

    if (n < 1000) {
      const hundredDigit = Math.floor(n / 100);
      const remainder = n % 100;
      return `${singleDigits[hundredDigit]} Hundred${remainder ? ' ' + convertTwoDigits(remainder) : ''}`;
    }

    if (n < 100000) {
      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;
      return `${convertTwoDigits(thousand)} Thousand${remainder ? ' ' + convertNumber(remainder) : ''}`;
    }

    if (n < 10000000) {
      const lakh = Math.floor(n / 100000);
      const remainder = n % 100000;
      return `${convertTwoDigits(lakh)} Lakh${remainder ? ' ' + convertNumber(remainder) : ''}`;
    }

    const crore = Math.floor(n / 10000000);
    const remainder = n % 10000000;
    return `${convertTwoDigits(crore)} Crore${remainder ? ' ' + convertNumber(remainder) : ''}`;
  }

  let result = 'INR ' + convertNumber(num).trim();

  if (decimal > 0) {
    result += ` and ${convertTwoDigits(decimal)} Paise`;
  }

  return result + ' Only';
}
