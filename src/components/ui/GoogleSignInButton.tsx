import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../../config";

interface GoogleSignInButtonProps {
  /** Called with the Google ID-token credential once the user signs in. */
  onCredential: (credential: string) => void;
  /** Controls the button label rendered by Google. */
  text?: "signin_with" | "signup_with" | "continue_with";
}

/**
 * Renders Google's official Sign-In button via Google Identity Services
 * (`renderButton`). This is the reliable, cross-browser flow.
 *
 * We deliberately do NOT use One Tap `prompt()`: modern Chrome silently
 * suppresses it (FedCM / third-party-cookie restrictions / dismissal
 * cooldown), which makes the button look like it does nothing on click.
 *
 * Requirements:
 *  - `VITE_GOOGLE_CLIENT_ID` must be set at build time.
 *  - The serving origin (localhost AND each deployed domain) must be listed
 *    under "Authorized JavaScript origins" for the OAuth client in Google
 *    Cloud Console, or the credential flow fails on click.
 */
export function GoogleSignInButton({
  onCredential,
  text = "continue_with",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest callback without forcing GSI to re-initialize.
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    const tryRender = (): boolean => {
      const gsi = (window as unknown as { google?: any }).google?.accounts?.id;
      if (!gsi || !containerRef.current || cancelled) return false;

      gsi.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential?: string }) => {
          if (response?.credential) callbackRef.current(response.credential);
        },
        use_fedcm_for_prompt: true,
      });

      // Clear any prior render (e.g. on hot reload) before rendering fresh.
      containerRef.current.replaceChildren();
      gsi.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text,
        shape: "pill",
        logo_alignment: "center",
        width: 320,
      });
      return true;
    };

    // The GSI script loads async; poll until it's ready.
    if (!tryRender()) {
      const interval = setInterval(() => {
        if (tryRender()) clearInterval(interval);
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
  }, [text]);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}
