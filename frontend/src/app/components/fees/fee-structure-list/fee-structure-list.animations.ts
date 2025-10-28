import { trigger, state, style, transition, animate } from '@angular/animations';

export const detailExpand = trigger('detailExpand', [
  state('collapsed', style({ height: '0px', minHeight: '0', opacity: 0 })),
  state('expanded', style({ height: '*', opacity: 1 })),
  transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
]);
