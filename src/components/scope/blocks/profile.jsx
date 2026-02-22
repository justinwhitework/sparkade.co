import React, { useState, useEffect, useRef } from "react";
import { BaseBlock, BlockActions } from "../ScopeBaseBlock";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../../ui/dropdown-menu.jsx";
import ScopeContainer from "../ScopeContainer.jsx";

const ProfileCard = ({ sourceLocation }) => {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [hasIntersected, setHasIntersected] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasIntersected || !sourceLocation) {
      if (!sourceLocation && hasIntersected) setStatus("failure");
      return;
    }

    const fetchProfile = async () => {
      setStatus("loading");
      try {
        const res = await fetch(sourceLocation);
        
        if (!res.ok) {
          throw new Error(`User not found: HTTP ${res.status}`);
        }

        const data = await res.json();

        // Validation & Console Warning
        if (!data || !data.name || !data.bio) {
          console.warn(`[ProfileRenderer] Invalid/Missing data at: ${sourceLocation}`, data);
          setStatus("failure");
          return;
        }

        setProfile(data);
        setStatus("idle");
      } catch (err) {
        console.error(`[ProfileRenderer] Error fetching ${sourceLocation}:`, err.message);
        setStatus("error");
      }
    };

    fetchProfile();
  }, [sourceLocation, hasIntersected]);

  // Don't render anything if the user is invalid or doesn't exist
  if (status === "error" || status === "failure") return null;

  const pinnedSocials = profile?.socials?.filter(s => s.pinned) || [];
  const otherSocials = profile?.socials?.filter(s => !s.pinned) || [];

  return (
    <div ref={containerRef} className="flex flex-1 justify-center min-w-full md:min-w-1/2 lg:min-w-1/3 md:max-w-3xl lg:max-w-4xl p-6 border border-base-content/10 rounded-xl bg-base-100">
      <ScopeContainer className="flex flex-col items-center text-center" state={status}>
        
        <div className="mb-4">
          {profile?.iconUrl ? (
            <img
              src={profile.iconUrl}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-base-100 ring-1 ring-base-content/5"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center text-[10px] opacity-40 uppercase font-black">
              Empty
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-base-content tracking-tight leading-tight">
            {profile?.name}
          </h3>
          <p className="text-sm opacity-60 font-medium mt-1">
            {profile?.bio}
          </p>
        </div>

        {pinnedSocials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {pinnedSocials.map((s, i) => (
              <button
                key={i}
                onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}
                className="px-4 py-1.5 bg-base-content/5 hover:bg-primary hover:text-primary-content text-xs font-bold rounded-lg transition-all active:scale-95"
              >
                {s.platform}
              </button>
            ))}
          </div>
        )}

        {otherSocials.length > 0 && (
          <BlockActions>
            <DropdownMenuLabel className="opacity-40 text-[9px] uppercase font-black tracking-widest px-2 py-2">
              Connect with {profile?.nameShort || "Person"}
            </DropdownMenuLabel>
            {otherSocials.map((s, i) => (
              <DropdownMenuItem 
                key={i} 
                onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}
                className="cursor-pointer gap-2 py-2.5"
              >
                <span className="font-semibold text-sm">{s.platform}</span>
              </DropdownMenuItem>
            ))}
          </BlockActions>
        )}
      </ScopeContainer>
    </div>
  );
};

const ProfileRenderer = ({ sourceLocation, children }) => {
  const locations = Array.isArray(sourceLocation) 
    ? sourceLocation 
    : sourceLocation ? [sourceLocation] : [];

  return (
    <BaseBlock className="w-full h-auto min-h-fit bg-transparent border-none mb-4" state="idle">
      <div className="flex flex-wrap gap-6 w-full justify-center md:justify-start">
        {locations.map((loc, index) => (
          <ProfileCard key={`${loc}-${index}`} sourceLocation={loc} />
        ))}
      </div>
      {children}
    </BaseBlock>
  );
};

export default ProfileRenderer;