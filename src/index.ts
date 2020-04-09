import {
  getPolicyName,
  getSubAction,
  getConcernName,
  resolveArray,
} from './utils';
import { IConcerns, IAuthorizer } from './types';

export default class Policy {
  private concerns: IConcerns = {};
  private policies: { [name: string]: Policy } = {};

  public register(concerns: string | string[], authorizer: IAuthorizer) {
    resolveArray(concerns).forEach(
      concern => (this.concerns[concern] = authorizer),
    );
  }

  public include(
    policies: string | string[],
    value: Policy | ((p: Policy) => void),
  ) {
    let policy: Policy;
    if (typeof value === 'function') {
      policy = new Policy();
      value(policy);
    } else {
      policy = value;
    }

    resolveArray(policies).forEach(name => (this.policies[name] = policy));
  }

  public can(viewer: any) {
    return {
      perform: (action: string) => ({
        on: (entity: any) => this.authorize(viewer, action, entity),
        having: (value?: any) => ({
          on: (entity: any) => this.authorize(viewer, action, entity, value),
        }),
      }),
    };
  }

  private authorize = (
    viewer: any,
    action: string,
    entity: any,
    value?: any,
  ): boolean => {
    const policy = this.policies[getPolicyName(action)];

    if (policy)
      return policy
        .can(viewer)
        .perform(getSubAction(action))
        .having(value)
        .on(entity);

    const concern = this.concerns[getConcernName(action)];

    if (concern)
      return concern({
        viewer,
        action,
        entity,
        value,
      });

    return false;
  };
}
