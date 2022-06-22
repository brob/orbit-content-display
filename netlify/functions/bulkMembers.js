const axios = require('axios');
const sanityClient = require('@sanity/client');
require('dotenv').config();

const client = sanityClient({
    projectId: process.env.SANITY_PROJECTID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    useCdn: false,
})

async function getMembers() {
    const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.ORBIT_KEY}`
        }
      };
      return fetch(`https://app.orbit.love/api/v1/${process.env.WORKSPACE_ID}/members?member_tags=content-creator`, options)
        .then(response => response.json())
        .then(response => response.data)
        .catch(err => console.error(err));
}


const handler = async (event) => {
    const members = await getMembers();
    console.log(members.length);
    const membersToAdd = members.map(member => {
        return {
            name: member.attributes.name,
            memberId: member.id,
            _id: member.id,
            _type: 'member',
        }
    })
    console.log(membersToAdd);
    // create sanity document for each member in membersToAdd
    const promises = membersToAdd.map(member => {
        return client.create(member)
    })
    const results = await Promise.all(promises);
    console.log(results);
}

module.exports = { handler }
