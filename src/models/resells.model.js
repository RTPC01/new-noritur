const { default: mongoose } = require("mongoose");

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
});

const resellSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
        hometown: String
    },
    image: [ImageSchema],
    price: Number,
    status: {
        type:Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Resell", resellSchema);