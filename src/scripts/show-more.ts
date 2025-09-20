export interface ShowMoreOptions {
  buttonSelector?: string;
  contentSelector?: string;
  expandedLabel?: string;
  collapsedLabel?: string;
}

const DEFAULT_OPTIONS: Required<ShowMoreOptions> = {
  buttonSelector: '#show-more-btn',
  contentSelector: '.hidden-services',
  expandedLabel: 'Zobrazit méně',
  collapsedLabel: 'Zobrazit více',
};

function resolveOptions(options: ShowMoreOptions = {}): Required<ShowMoreOptions> {
  return { ...DEFAULT_OPTIONS, ...options };
}

export default function initShowMore(options?: ShowMoreOptions) {
  if (typeof window === 'undefined') return;

  const { buttonSelector, contentSelector, expandedLabel, collapsedLabel } =
    resolveOptions(options);

  const button = document.querySelector<HTMLButtonElement>(buttonSelector);
  const content = document.querySelector<HTMLElement>(contentSelector);

  if (!button || !content) return;

  const expandedText = button.dataset.expandedLabel ?? expandedLabel;
  const collapsedText = button.dataset.collapsedLabel ?? collapsedLabel;

  const setExpanded = (expanded: boolean) => {
    content.hidden = !expanded;
    button.textContent = expanded ? expandedText : collapsedText;
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };

  setExpanded(!content.hidden);

  button.addEventListener('click', () => {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    setExpanded(!isExpanded);
  });
}
