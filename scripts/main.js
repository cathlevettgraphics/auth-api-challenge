/*************************
 *
 * GET DATA
 *
 *************************/

const signInForm = document.forms['sign-in-form'];

signInForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(signInForm);
  const userDetails = Object.fromEntries(formData);

  const userData = {
    username: userDetails.user,
    password: userDetails.password,
    type: 'USER_PASSWORD_AUTH',
  };

  console.log('full user details ', userData);
  // window.location.href = './policy.html';

  signInUser(userData);
});

/*************************
 *
 * MAKE AUTH REQUEST
 *
 *************************/

async function signInUser(userData) {
  try {
    const response = await fetch('https://api.bybits.co.uk/auth/token', {
      method: 'POST',
      headers: {
        environment: 'mock',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      // store the data
      const userOK = await response.json();
      const accessToken = userOK.access_token;
      console.log('full user response is', userOK);
      console.log('access access token is ', accessToken);

      // use access token and make request for policy data
      getPolicyData(accessToken);
    } else {
      // Show user login error if bad fetch
      logInError();
      throw new Error(response);
    }
  } catch (err) {
    console.log('error', err.sendMessage || err.statusText);
  }
}

/*************************
 *
 * MAKE POLICY DATA REQUEST
 *
 *************************/

export default async function getPolicyData(accessToken) {
  try {
    const response = await fetch('https://api.bybits.co.uk/policys/details', {
      headers: {
        Authorization: `bearer ${accessToken}`,
        Environment: 'mock',
      },
    });

    if (response.ok) {
      // render the data
      const policyDetails = await response.json();
      console.log('secure policy details are', policyDetails);

      // Render the policy details
      renderPolicyData(policyDetails);
    } else {
      throw new Error(response);
    }
  } catch (err) {
    console.log('error', err.sendMessage || err.statusText);
  }
}

/*************************
 *
 * RENDER THE AUTHENTICATED DATA
 *
 *************************/

const policyMountNode = document.getElementById('target-policy');

function renderPolicyData(policyDetails) {
  const list = document.createElement('ul');
  list.classList.add('policy-list-wrapper');

  const li = document.createElement('li');
  li.classList.add('policy-list');
  li.innerHTML = `
        <li class="policy-wrapper">
         <h2 class="policy-head">your policy details</h2>
        <h3 class="policy-cover">policy reference</h3>
        <p class="policy-cover">${policyDetails.policy_reference}</p>
        </li>

        <li class="policy-wrapper">
        <h3 class="policy-cover">cover type</h3>
        <p class="policy-cover">${policyDetails.policy.cover}</p>
        </li>
      
        <li class="policy-wrapper">
        <h3 class="policy-cover">car</h3>
        <p class="policy-cover">${policyDetails.vehicle.make}</p>
        </li>

         <li class="policy-wrapper">
        <h3 class="policy-cover">address</h3>
        <p class="policy-cover">${policyDetails.policy.address.line_1}, ${policyDetails.policy.address.line_2}, ${policyDetails.policy.address.postcode}</p>
        </li>
        `;
  list.append(li);

  policyMountNode.innerHTML = '';
  policyMountNode.append(list);
}

function logInError() {
  const list = document.createElement('ul');
  list.classList.add('policy-list-wrapper');

  const li = document.createElement('li');
  li.classList.add('policy-list');
  li.innerHTML = `
        <li class="policy-wrapper">
        <h3 class="policy-cover">error</h3>
        <p class="policy-cover">username or password not recognised – please try again</p>
        </li>
        `;
  list.append(li);

  policyMountNode.innerHTML = '';
  policyMountNode.append(list);
}
