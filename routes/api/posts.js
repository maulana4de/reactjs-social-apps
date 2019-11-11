const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const ProfileModel = require('../../models/Profile');
const UserModel = require('../../models/User');
const PostModel = require('../../models/Post');

// @route     Post api/posts
// @desc      Create a posts
// @access    Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await UserModel.findById(req.user.id).select('-password');
      const newPost = new PostModel({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route     Get api/posts
// @desc      Get all posts
// @access    Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route     Get api/posts/:id
// @desc      Get post by ID
// @access    Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server error');
  }
});

// @route     Delete api/posts/:id
// @desc      Delete a post
// @access    Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    console.log(post.user);

    await post.remove();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server error');
  }
});

// @route     PUT api/posts/like/:id
// @desc      Like a post
// @access    Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route     PUT api/posts/unlike/:id
// @desc      Unike a post
// @access    Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    console.log(post);
    console.log(req.user.id);

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    console.log(removeIndex);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route     Post api/posts/comment/:id
// @desc      Comment on a post
// @access    Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await UserModel.findById(req.user.id).select('-password');
      const post = await PostModel.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route     Delete api/posts/comment/:id/:comment_id
// @desc      Delete comment
// @access    Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment doest not exists' });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    console.log(removeIndex);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
