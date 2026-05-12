interface IconProps {
  size?: number;
  className?: string;
}

const icon = (path: React.ReactNode) =>
  ({ size = 16, className }: IconProps) => (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );

export const IconHome     = icon(<path d="M2 6.5L8 2l6 4.5V14a.5.5 0 01-.5.5H10V10H6v4.5H2.5A.5.5 0 012 14V6.5z"/>);
export const IconAgents   = icon(<><circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5"/></>);
export const IconTasks    = icon(<><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8l2 2 4-4"/></>);
export const IconActivity = icon(<path d="M1 8h2l2-5 3 10 2-6 1.5 3H15"/>);
export const IconBudget   = icon(<><circle cx="8" cy="8" r="6"/><path d="M8 5v1.5M8 9.5V11M6.5 7a1.5 1.5 0 013 0c0 .828-.672 1.5-1.5 1.5H8a1.5 1.5 0 010 3"/></>);
export const IconOrg      = icon(<><rect x="6" y="1" width="4" height="3" rx="1"/><rect x="1" y="9" width="4" height="3" rx="1"/><rect x="11" y="9" width="4" height="3" rx="1"/><path d="M8 4v2.5M3 9V7h10v2"/></>);
export const IconSettings = icon(<><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05"/></>);
export const IconLogout   = icon(<path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-3-4-3M14 8H6"/>);
export const IconPlus     = icon(<path d="M8 3v10M3 8h10"/>);
export const IconX        = icon(<path d="M4 4l8 8M12 4l-8 8"/>);
export const IconCheck    = icon(<path d="M3 8l3.5 3.5L13 4"/>);
export const IconZap      = icon(<path d="M9 1L4 9h5l-2 6 7-9h-5l2-5z"/>);
export const IconCircle   = icon(<circle cx="8" cy="8" r="5.5"/>);
export const IconClock    = icon(<><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5l2 2"/></>);