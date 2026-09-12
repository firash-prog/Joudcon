import './globals.css';
export default function Root({ children }: { children: React.ReactNode }) {
  // Single <html>/<body> for the whole app. Locale layouts set lang/dir on a wrapper div.
  return (<html lang="en"><body>{children}</body></html>);
}
