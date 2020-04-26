export const getPolicyName = (action: string): string => {
  const tokens = action.replace(/^:/, '').split(':');

  return tokens.length > 1 ? tokens[0] : '';
};

export const getSubAction = (action: string): string => {
  const subAction = action.replace(/^[^:]*:/, '');

  return subAction.indexOf(':') === -1 ? ':' + subAction : subAction;
};

export const getConcernName = (action: string): string => {
  const tokens = action.split(':');

  return tokens[tokens.length - 1];
};

export const resolveArray = <T>(value: T | T[]): T[] => {
  let names: T[];
  if (Array.isArray(value)) {
    names = value;
  } else {
    names = [value];
  }

  return names;
};
