import * as t from 'io-ts';

export const argoCDAppDetails = t.type({
  metadata: t.type({ name: t.string }),
  status: t.type({
    sync: t.type({
      status: t.string,
    }),
    health: t.type({
      status: t.string,
    }),
    operationState: t.type({
      finishedAt: t.string,
    }),
    history: t.array(t.type({
      id: t.number,
      revision: t.string,
      deployedAt: t.string,
    })),
  }),
});

export type ArgoCDAppDetails = t.TypeOf<typeof argoCDAppDetails>;

export const argoCDAppList = t.type({
  items: t.array(argoCDAppDetails),
});

export type ArgoCDAppList = t.TypeOf<typeof argoCDAppList>;
