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

  // console.log('full user details ', userData);

  signInUser(userData);
  signInForm.reset();
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

    if (userData.username !== '' && userData.password !== '') {
      const userOK = await response.json();
      const accessToken = userOK.access_token;
      // console.log('full user response is', userOK);
      // console.log('access access token is ', accessToken);

      // use access token and make request for policy data
      getPolicyData(accessToken);
    } else {
      // Show user login error if no username or password emtered
      logInError();
      throw new Error(response);
    }
  } catch (err) {
    console.log('error', err.statusText);
  }
}

/*************************
 *
 * MAKE POLICY DATA REQUEST
 *
 *************************/

async function getPolicyData(accessToken) {
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
      // console.log('secure policy details are', policyDetails);

      // SAVE TO SESSION
      sessionStorage.setItem('policyDetails', JSON.stringify(policyDetails));

      // route to policy page
      window.location.assign('policy.html');
    } else {
      throw new Error(response);
    }
  } catch (err) {
    console.log('error', err.statusText);
  }
}

/*************************
 *
 * RENDER THE AUTHENTICATED DATA
 *
 *************************/

const policyMountNode = document.getElementById('target-policy');
const policyMountNodeDetails = document.getElementById('target-policy-details');

function renderPolicyData() {
  // GET FROM SESSION
  const policyDetails = JSON.parse(sessionStorage.getItem('policyDetails'));
  // console.log(policyDetails);

  // Create list
  const list = document.createElement('ul');
  list.classList.add('policy-list-wrapper');

  const li = document.createElement('li');
  li.classList.add('policy-list');
  li.innerHTML = `
        <li class="policy-wrapper">
        <h3 class="policy-cover">reference</h3>
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

  policyMountNodeDetails.innerHTML = '';
  policyMountNodeDetails.append(list);
}

/*************************
 *
 * RENDER DATA ON POLICY PAGE
 *
 *************************/

renderPolicyData();

/*************************
 *
 * RENDER ERROR IF NO USERNAME OR PASSWORD
 *
 *************************/

function logInError() {
  const list = document.createElement('ul');
  list.classList.add('policy-list-wrapper');

  const li = document.createElement('li');
  li.classList.add('policy-list');
  li.innerHTML = `
        <li class="policy-wrapper">
        <h3 class="policy-cover">error</h3>
        <p class="policy-cover">please enter a username and password</p>
        </li>
        `;
  list.append(li);

  policyMountNode.innerHTML = '';
  policyMountNode.append(list);
}
