export function showBool(text: string | undefined, b: boolean) {
  const bText = b ? 'true' : 'false';
  if (text === undefined) {
    return bText;
  }
  return `${text} : ${bText}`;
}
