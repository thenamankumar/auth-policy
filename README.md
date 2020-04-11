# auth-policy
A minimal authorization policy builder which defines if a viewer can perform an action on an entity. The Policy can be defined in a declarative manner and can be consumed at various layers of any application.

## Usage
```
yarn add auth-policy
```

```javascript
import Policy from 'auth-policy'

// create a new policy
const userPolicy = new Policy();

// register concern
userPolicy.register('update', ({ viewer, entity: user, value }) => {
  if(viewer.role === 'Admin') return true;
    
  if(viewer.id === user.id) {
    if(value.role === 'Admin') return false;
      
    return true;
  }
    
  return false;
});

// verify authorization
userPolicy.can(viewer).perform(':update').having(value).on(user);
```

## Documentation

 Name | Description
------------ | -------------
viewer| The user for whom the authorization is being verified.
action| A string which defines the action to be performed by the viewer.
entity| The object against which the action is to be performed.
value| The value associated with the action.

### Concerns
Every policy has multiple concerns, each of which maps to an action performed by the viewer and defines if the viewer is authorized to perfom that certain action. Concerns are added to a policy using the `register` function.

```javascript
import Policy from 'auth-policy';

const userPolicy = new Policy();

// registering a single concern
// associated action = ':read'
userPolicy.register('read', ({ viewer }) => !!viewer);

// registering multiple concerns with same authorization policy
// associated actions = ':update', ':delete'
userPolicy.register(['update', 'delete'], ({ viewer, entity }) => 
  viewer.role === 'Admin' || viewer.id === entity.id
);
```

### Child Policies
Any policy can have multiple child policies which can be included using the `include` function. It is recommended to have a single root level policy and nest all the other entity level policies inside it.

A policy can be included in two ways, either by passing a prebuilt instance of `Policy` or using a callback function which receives a fresh instance of `Policy` in the argument that can be used to define the concerns inside the function. Policies can be deeply nested as much as you need.

```javascript
import Policy from 'auth-policy';

const postPolicy = new Policy();
// associated action = ':read'
postPolicy.register('read', ({ viewer, entity }) => 
  entity.isPublished || viewer.id === entity.publisher_id
);

const policy = new Policy();

// including a prebuilt policy
// available actions = 'post:read'
policy.include('post', postPolicy);

// using a callback function to define a new policy
// accociated actions = 'user:read', 'user:email:update', 'user:phone_number:update'
policy.include('user', p => {
  p.register('read', ({ viewer }) => !!viewer);
  
  // include another set of nested policies at once
  p.include(['email', 'phone_number'], p => {
    p.register('update', ({ viewer, entity: user }) => viewer.id === user.id);
  });
});
```

### Authorization
Once the policy is defined we can simply use the `can` function chain to verify the access to the viewer for a certain action.

```javascript
import Policy from 'auth-policy';

const policy = new Policy();

policy.include('invite', p => {
  p.register('read', () => true);
  p.register('update', ({ viewer, entity: invite, value }) => {
    if(viewer.id === invite.organiser_id) return true;
      
    if(viewer.id === invite.user_id) {
      if(invite.status === 'Requested' && value.status === 'Accepted')
        return false;
      
      return true;
    } 
      
    return false;
  });
});

const viewer = { id: 1 };
const organiser = { id: 2 };
const invite = { user_id: 1, organiser_id: 2, status: 'Requested' };

policy.can(viewer).perform('invite:read').on(invite); // true

const updatedValue = { status: 'Accepted' };

/* pass value using `having` function if
 * there is any value associated with the action. */
policy.can(viewer).perform('invite:update').having(updatedValue).on(invite) // false

policy.can(organiser).perform('invite:update').having(updatedValue).on(invite) // true
```
