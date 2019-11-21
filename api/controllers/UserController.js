/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



module.exports = {

    create: async function (req, res) {
        var params = req.allParams()

        var createdUser = await User.create(params).fetch();

        return res.ok(createdUser);

    },
    update: async function (req,res) {
        var params = req.allParams()
        var updatedUser = await User.updateOne({ name: params.name })
            .set(params);

        if (updatedUser) {
            res.ok('Updated the user named ' + params.name);
        }
        else {
            sails.log('The database does not contain a user named ' + params.name);
        }

    },
    findall: async function (req, res) {
        var records = await User.find();

        return res.ok(records)

    },
    setRanking: function (req, res) {
        var params = req.allParams()

        var db = User.getDatastore().manager;

        var rawMongoCollection = db.collection('user');

        //sails.log(rawMongoCollection)

        //Item = mongoose.model(rawMongoCollection)
        /*
        params.type - String
        params.limit - integer
        */
        // function getRankedItems(params, callback) {
        //     if (params.type === 'all') {
        //         params.type = { $exists: true };
        //     }

        // }

        rawMongoCollection.aggregate([
            {
                $match:
                    //{ isDeleted: { $ne: true }, type: params.type }
                    { isDeleted: { $ne: true } }
            }, //end $match
            {
                $project:
                {
                    item: "$_id",
                    ranking: {
                        $divide: [
                            {
                                $add: [
                                    "$upvotes",
                                    { $multiply: ["$numComments", 0.08] },
                                    { $multiply: ["$views", 0.002] },
                                    0.75
                                ]
                            }, //end $add
                            //1,
                            {
                                $add: [
                                    1,
                                    {
                                        $subtract: [
                                            {
                                                $multiply: [ // this is a workaround for mongo version 3.0 (no $pow)
                                                    {
                                                        $multiply: [
                                                            { $divide: [{ $subtract: [new Date(), new Date("$createdAt")] }, 14400000] },
                                                            .4
                                                        ]
                                                    }, //end $multiply
                                                    {
                                                        $multiply: [
                                                            { $divide: [{ $subtract: [new Date(), new Date("$createdAt")] }, 14400000] },
                                                            .4
                                                        ]
                                                    } //end $multiply
                                                ]
                                            }, //end $multiply
                                            {
                                                $multiply: [ // this is a workaround for mongo version 3.0 (no $pow)
                                                    {
                                                        $multiply: [
                                                            {
                                                                $subtract: [
                                                                    { $divide: [{ $subtract: [new Date(), new Date("$createdAt")] }, 14400000] },
                                                                    { $divide: [{ $subtract: [new Date(), new Date("$updatedAt")] }, 14400000] }
                                                                ]
                                                            }, //end $subtract
                                                            .3
                                                        ]
                                                    }, //end $multiply
                                                    {
                                                        $multiply: [
                                                            {
                                                                $subtract: [
                                                                    { $divide: [{ $subtract: [new Date(), new Date("$createdAt")] }, 14400000] },
                                                                    { $divide: [{ $subtract: [new Date(), new Date("$updatedAt")] }, 14400000] }
                                                                ]
                                                            }, //end $subtract
                                                            .3
                                                        ]
                                                    } //end $multiply
                                                ]
                                            } //end $multiply
                                        ]
                                    } //end $subtract
                                ]
                            } //end $add
                        ]
                    } //end $divide
                }
            }, //end $project
            { $sort: { ranking: -1 } },
            { $limit: parseInt(params.limit) }
        ],
            function (err, results) {
                sails.log(results)
                res.ok(results)
                if (err) {
                    sails.log(err);
                    //return callback(err);
                }
                //callback(null, results);
            }
        ); //end Items.aggregate


    }

};

