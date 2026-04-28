const sidebarLinks = [
  { label: "Focus and Scope", href: "/about#scope" },
  { label: "Publication Ethics", href: "/about#ethics" },
  { label: "Article Processing Fee", href: "/about#apf" },
  { label: "Peer Reviewers Process", href: "/about#review-process" },
  { label: "Peer Reviewers", href: "/about#editors" },
  { label: "Open Access Statement", href: "/about#open-access" },
  { label: "Plagiarism", href: "/about#plagiarism" },
  { label: "Copyright Notice", href: "/about#copyright" },
  { label: "Contact", href: "/about#contact" },
  { label: "Article Withdrawal", href: "/about#withdrawal" },
];

export default function JournalSidebar() {
  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="sticky top-24 rounded-xl overflow-hidden border border-[var(--border-default)]
                      bg-[var(--bg-surface)]">
        {sidebarLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            className={`block px-4 py-3 text-sm text-[var(--text-secondary)]
                        hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]
                        transition-colors duration-150
                        ${i > 0 ? "border-t border-[var(--border-default)]" : ""}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
