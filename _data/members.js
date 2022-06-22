require('dotenv').config()
const sanityClient = require('@sanity/client')

const client = sanityClient({
    projectId: process.env.SANITY_PROJECTID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    // CDN will not be used if token is set
    useCdn: true,
  })


// export 11ty data function
module.exports = async function() {

    // get all members
    const members = await client.fetch((`*[_type == 'member']{
        name,
        memberId,
        "tweets": *[_type=='tweet' && references(^._id)],
        "articles": *[_type== 'content' && references(^._id)]
      }`))
    return members
}