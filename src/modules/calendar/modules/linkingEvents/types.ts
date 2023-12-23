import { TimeEvent } from '../../types';

export type LinkedEventsNode<E extends TimeEvent = TimeEvent> = TimeEvent & {
    events?: E[];
};
