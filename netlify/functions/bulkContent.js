const axios = require('axios');
const sanityClient = require('@sanity/client');
require('dotenv').config();

const client = sanityClient({
    projectId: process.env.SANITY_PROJECTID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    useCdn: false,
})

async function getActivities() {
    const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.ORBIT_KEY}`
        }
      };
      return fetch(`https://app.orbit.love/api/v1/${process.env.WORKSPACE_ID}/activities?activity_type=post%3Acreated&affiliation=member&member_tags=content-creator&activity_type=tweet%3Asent`, options)
        .then(response => response.json())
        .then(response => response.data)
        .catch(err => console.error(err));
}


const handler = async (event) => {
    const activities = await getActivities();
    // console.log(activities);
    const activitiesToAdd = activities.map(activity => {
        // console.log(activity)
        return {
            text: activity.attributes.t_tweet.full_text,
            tweetHtml: activity.attributes.t_tweet.text_html,
            member: {
                _type: 'reference',
                _ref: activity.relationships.member.data.id,
            },
            link: activity.attributes.activity_link,
            _id: activity.id,
            _type: 'tweet',
            _createdAt: activity.attributes.created_at,
        }
    })
    console.log(activitiesToAdd);
    // create sanity document for each member in membersToAdd
    const promises = activitiesToAdd.map(activity => {
        return client.create(activity)
    })
    const results = await Promise.all(promises);
    console.log(results);
}

module.exports = { handler }
