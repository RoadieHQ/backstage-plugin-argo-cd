export type ArgoCDAppDetails = {
  metadata: {
    name: string;
  };
  status: {
    sync: {
      status: string;
    };
    health: {
      status: string;
    };
    operationState: {
      finishedAt: string;
    };
  };
};
