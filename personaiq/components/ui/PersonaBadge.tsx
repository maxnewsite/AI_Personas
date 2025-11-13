import { PersonaType } from '@prisma/client';

interface PersonaBadgeProps {
  persona: PersonaType;
  size?: 'sm' | 'md' | 'lg';
}

const personaConfig = {
  TRAILBLAZER: {
    label: 'Trailblazer',
    className: 'persona-badge-trailblazer'
  },
  ESTABLISHED: {
    label: 'Established',
    className: 'persona-badge-established'
  },
  EMERGING: {
    label: 'Emerging',
    className: 'persona-badge-emerging'
  },
  OVERWHELMED: {
    label: 'Overwhelmed',
    className: 'persona-badge-overwhelmed'
  },
  RESISTANT: {
    label: 'Resistant',
    className: 'persona-badge-resistant'
  }
};

export function PersonaBadge({ persona, size = 'md' }: PersonaBadgeProps) {
  const config = personaConfig[persona];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <span className={`persona-badge ${config.className} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}

export function PersonaDescription({ persona }: { persona: PersonaType }) {
  const descriptions = {
    TRAILBLAZER: 'Advanced users who actively experiment, share knowledge, and lead AI adoption initiatives.',
    ESTABLISHED: 'Consistent users who have established reliable AI workflows for recurring tasks.',
    EMERGING: 'Users with positive attitudes but inconsistent usage patterns and developing confidence.',
    OVERWHELMED: 'Users who struggle with task decomposition, delegation, and managing AI integration.',
    RESISTANT: 'Users with concerns about ethics, job security, or preference for traditional methods.'
  };

  return (
    <p className="text-gray-600 text-sm">
      {descriptions[persona]}
    </p>
  );
}
