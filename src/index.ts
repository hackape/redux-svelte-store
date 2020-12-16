interface Store<A> {
  getState(): A;
  subscribe(fn: () => void): () => void;
}

type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;
interface Readable<T> {
  /**
   * Subscribe on value changes.
   * @param run subscription callback
   */
  subscribe(run: Subscriber<T>): Unsubscriber;
}

function identity(x: any) {
  return x;
}

function get(object: any, path: string[]) {
  var index = 0,
    length = path.length;

  while (object != null && index < length) {
    object = object[path[index++]];
  }
  return index && index == length ? object : undefined;
}

function unifySelector(args: any[]) {
  if (!args.length) return identity;
  if (args.every((v) => typeof v === "string")) {
    return (state: any) => get(state, args);
  }
  if (typeof args[0] === "function") {
    return args[0];
  }
  throw Error("Invalid selector args");
}

function toReadable<A>(store: Store<A>): Readable<A>;
function toReadable<A, T extends (state: A) => any>(
  store: Store<A>,
  selector: T
): T extends (state: A) => infer R ? Readable<R> : Readable<any>;
function toReadable<A, P1 extends keyof A>(store: Store<A>, p1: P1): Readable<A[P1]>;
function toReadable<A, P1 extends keyof A, P2 extends keyof A[P1]>(store: Store<A>, p1: P1, p2: P2): Readable<A[P1][P2]>;
function toReadable<A, P1 extends keyof A, P2 extends keyof A[P1], P3 extends keyof A[P1][P2]>(
  store: Store<A>,
  p1: P1,
  p2: P2,
  p3: P3
): Readable<A[P1][P2][P3]>;
function toReadable<A, P1 extends keyof A, P2 extends keyof A[P1], P3 extends keyof A[P1][P2], P4 extends keyof A[P1][P2][P3]>(
  store: Store<A>,
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4
): Readable<A[P1][P2][P3][P4]>;
function toReadable(store: Store<any>, ...args: any[]): any {
  const subscribers = [];
  const selector = unifySelector(args);
  let stop: () => void;

  function subscribe(run: Subscriber<any>): Unsubscriber {
    let prevState = null;
    const subscriber = (state: any) => {
      const currState = selector(state);
      if (prevState !== currState) {
        prevState = currState;
        run(currState);
      }
    };

    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = store.subscribe(() => {
        const appState = store.getState();
        for (let i = 0; i < subscribers.length; i += 1) {
          const s = subscribers[i];
          s(appState);
        }
      });
    }

    subscriber(store.getState());

    const unsubscribe = () => {
      const index = subscribers.indexOf(subscriber);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };

    return unsubscribe;
  }

  return { subscribe } as any;
}

export default toReadable;
