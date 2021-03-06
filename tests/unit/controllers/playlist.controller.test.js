const requestMocks = require('../../utils/request.mock.js');
const { playlistController } = require('../../../src/controllers');
const fs = require('fs');
const _ = require('lodash');
const move = require('lodash-move');

let {
  Track,
  Playlist,
  User,
  PlaylistFollowings
} = require('../../../src/models');
const mockingoose = require('mockingoose').default;

const playlistsIds = ['5e6dea511e17a305285ba614', '5e6dea511e17a305285ba615'];

const usersIds = ['5e6dea511e17a305285ba616', '5e6dea511e17a305285ba617'];

const trackIds = [
  '5e6c8ebb8b40fc5508fe8b89',
  '5e6f6a7fac1d6d06f4070b99',
  '5e6c8ebb8b40fc5518fe8b97'
];
const artistIds = [
  '5e6c8ebb8b40fc5508fe8b32',
  '5e6c8ebb8b40fc6608fe8b31',
  '5e6c8ebb8b40fc7708fe8b30'
];
const genreIds = [
  '5e6c8ebb8b40fc5508fe8b20',
  '5e6c8ebb8b40fc6608fe8b21',
  '5e6c8ebb8b40fc7708fe8b22'
];

describe('playlist controllers', () => {
  let req;
  let res;
  let next;
  let user;
  let track;
  let tracks;
  let playlist;
  let playlistFollowing;
  let playlistFollowings;
  let playlists;
  beforeEach(() => {
    playlistFollowing = new PlaylistFollowings({
      userId: usersIds[0],
      playlistId: playlistsIds[0],
      public: true
    });
    user = new User({
      name: 'Ahmed'
    });
    track = new Track({
      name: 'mohamed',
      audioUrl: 'lol.mp3',
      artists: artistIds,
      album: '5e6c8ebb8b40fc7708fe8b32',
      duration: 21000
    });
    playlistFollowings = [playlistFollowing, playlistFollowing];
    tracks = [track, track];
    playlist = new Playlist({
      name: 'playlist1',
      public: true,
      collabrative: true,
      description: 'dsjbfjdbgjksdn',
      owner: '5e6c8ebb8b40fc7708fe8b74',
      tracks: trackIds,
      image: 'uploads\\default.jpg'
    });
    playlists = [playlist, playlist];
    req = { params: {}, query: {}, body: {}, file: {}, baseUrl: '', user: {} };
    res = requestMocks.mockResponse();
    next = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  }); 
  describe('getPlaylist - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.getPlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.getPlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      Playlist.select = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(null, 'findOne');
      await playlistController.getPlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if playlist with the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      Playlist.select = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      await playlistController.getPlaylist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return Playlist with the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      Playlist.select = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      await playlistController.getPlaylist(req, res, next);
      const foundPlaylist = res.json.mock.calls[0][0];
      expect(foundPlaylist).toBe(playlist);
    });
  });
  describe('changePlaylist - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.changePlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.changePlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      mockingoose(Playlist).toReturn(null, 'findOneAndUpdate');
      await playlistController.changePlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error if there is an error other than "ENOENT (No such file or directory)"', async () => {
      req.params.id = usersIds[0];
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      playlist.image = 'bhjhvd.js';
      req.file.path = 'hfjhgjh.jpg';
      const error = { code: 'EACCES', message: 'Permission denied' };
      jest.mock('fs');
      fs.promises.unlink = jest.fn();
      fs.promises.unlink.mockImplementationOnce(() => Promise.reject(error));
      expect.assertions(1);

      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      try {
        await playlistController.changePlaylist(req, res, next);
      }
      catch(e){
        expect(e).toBe(error);
      }
    });
    it('should return 200 if playlist with the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      (await playlistController.changePlaylist(req, res, next));
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return playlist with new details has the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      await playlistController.changePlaylist(req, res, next);
      const foundPlaylist = res.json.mock.calls[0][0];
      expect(foundPlaylist).toBe(playlist);
    });
    it('should return 200 if playlist with the passed id exists when req.file is null', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      req.file = null;
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      await playlistController.changePlaylist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return playlist with new details has the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      req.file = null;
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      await playlistController.changePlaylist(req, res, next);
      const foundPlaylist = res.json.mock.calls[0][0];
      expect(foundPlaylist).toBe(playlist);
    });
  });
  describe('uploadImage - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.uploadImageRoute(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.uploadImageRoute(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.file.path = 'uploads\\default.jpg';
      mockingoose(Playlist).toReturn(null, 'findOne');
      await playlistController.uploadImageRoute(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error if there is an error other than "ENOENT (No such file or directory)"', async () => {
      req.params.id = playlistsIds[0];
      playlist.image = 'Magdy.jpg';
      req.file.path = 'hfjhgjh.jpg';
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      const error = { code: 'EACCES', message: 'Permission denied' };
      jest.mock('fs');
      fs.promises.unlink = jest.fn();
      fs.promises.unlink.mockImplementationOnce(() => Promise.reject(error));
      expect.assertions(1);

      try {
        await playlistController.uploadImageRoute(req, res, next);
      }
      catch(e){
        expect(e).toBe(error);
      }
    });
    it('should return 200 if playlist with the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      req.file.path = playlist.image;
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      await playlistController.uploadImageRoute(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });
  });
  describe('getImage - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.getImage(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.getImage(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 404 when playlistId is not valid', async () => {
      req.params.id = 'invalid';
      Playlist.select = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(null, 'findOne');
      await playlistController.getImage(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 when playlistId is valid', async () => {
      req.params.id = playlistsIds[0];
      Playlist.select = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlists[0], 'findOne');
      await playlistController.getImage(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return playlist image when playlistId is valid', async () => {
      req.params.id = playlistsIds[0];
      Playlist.select = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlists[0], 'findOne');
      await playlistController.getImage(req, res, next);
      const image = res.json.mock.calls[0][0];
      expect(image).toBe(playlists[0].image);
    });
  });
  describe('getTracks - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.getTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.getTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.query = {
        offset: 0,
        limit: 1
      };
      mockingoose(Playlist).toReturn(null, 'findOne');
      await playlistController.getTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if playlist with the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      req.query = {
        offset: 0,
        limit: 1
      };
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      mockingoose(Track).toReturn(tracks, 'find');
      await playlistController.getTracks(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return tracks of playlist with the passed id exists', async () => {
      req.params.id = playlistsIds[0];
      req.query = {
        offset: 0,
        limit: 1
      };
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      mockingoose(Track).toReturn(tracks.slice(0, 1), 'find');
      await playlistController.getTracks(req, res, next);
      const foundTracks = res.json.mock.calls[0][0].items;
      expect(JSON.parse(JSON.stringify(foundTracks))).toStrictEqual(
        JSON.parse(JSON.stringify(tracks.slice(0, 1)))
      );
    });
  });
  describe('getUserPlaylist - test', () => {
    it('should throw error 404 when url is /api/v1/playlists', async () => {
      req.baseUrl = '/api/v1/playlists';
      await playlistController.getUserPlaylists(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 400 when url has users in it but has query Paramter is owner', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      req.query.isOwner = true;
      await playlistController.getUserPlaylists(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
    it('should throw error 404 when invalid id is passed for users url', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      req.params.id = 'invalid';
      mockingoose(User).toReturn(null, 'findOne');
      await playlistController.getUserPlaylists(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if user with the passed id exists for users url', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      req.params.id = usersIds[0];
      PlaylistFollowings.select = jest.fn().mockReturnThis();
      PlaylistFollowings.populate = jest.fn().mockReturnThis();
      PlaylistFollowings.skip = jest.fn().mockReturnThis();
      PlaylistFollowings.limit = jest.fn().mockReturnThis();
      PlaylistFollowings.where = jest.fn().mockReturnThis();
      mockingoose(User).toReturn(user, 'findOne');
      mockingoose(PlaylistFollowings).toReturn(playlistFollowings, 'find');
      await playlistController.getUserPlaylists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return Playlist with the passed id exists for users url', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      req.params.id = usersIds[0];
      PlaylistFollowings.select = jest.fn().mockReturnThis();
      PlaylistFollowings.populate = jest.fn().mockReturnThis();
      PlaylistFollowings.skip = jest.fn().mockReturnThis();
      PlaylistFollowings.limit = jest.fn().mockReturnThis();
      PlaylistFollowings.where = jest.fn().mockReturnThis();
      mockingoose(User).toReturn(user, 'findOne');
      mockingoose(PlaylistFollowings).toReturn(playlistFollowings, 'find');
      await playlistController.getUserPlaylists(req, res, next);
      const foundPlaylists = res.json.mock.calls[0][0].items;
      expect(foundPlaylists).toEqual([
        playlistFollowings[0].playlistId,
        playlistFollowings[1].playlistId
      ]);
    });
    it('should return 200 if user with the passed id exists for me url', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      req.user.id = usersIds[0];
      await playlistController.getUserPlaylists(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
    it('should return 200 if user with the passed id exists for me url', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      req.query.isOwner = false;
      req.user.id = usersIds[0];
      PlaylistFollowings.select = jest.fn().mockReturnThis();
      PlaylistFollowings.populate = jest.fn().mockReturnThis();
      PlaylistFollowings.skip = jest.fn().mockReturnThis();
      PlaylistFollowings.limit = jest.fn().mockReturnThis();
      PlaylistFollowings.where = jest.fn().mockReturnThis();
      mockingoose(PlaylistFollowings).toReturn(playlistFollowings, 'find');
      await playlistController.getUserPlaylists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return Playlist with the passed id exists for me url', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      req.query.isOwner = false;
      req.user.id = usersIds[0];
      PlaylistFollowings.select = jest.fn().mockReturnThis();
      PlaylistFollowings.populate = jest.fn().mockReturnThis();
      PlaylistFollowings.skip = jest.fn().mockReturnThis();
      PlaylistFollowings.limit = jest.fn().mockReturnThis();
      PlaylistFollowings.where = jest.fn().mockReturnThis();
      mockingoose(PlaylistFollowings).toReturn(playlistFollowings, 'find');
      await playlistController.getUserPlaylists(req, res, next);
      const foundPlaylists = res.json.mock.calls[0][0].items;
      expect(foundPlaylists).toEqual([
        playlistFollowings[0].playlistId,
        playlistFollowings[1].playlistId
      ]);
    });
    it('should return 200 if user with the passed id exists for me url', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      req.query.isOwner = true;
      req.user.id = usersIds[0];
      Playlist.select = jest.fn().mockReturnThis();
      Playlist.populate = jest.fn().mockReturnThis();
      Playlist.skip = jest.fn().mockReturnThis();
      Playlist.limit = jest.fn().mockReturnThis();
      Playlist.where = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlistFollowings, 'find');
      await playlistController.getUserPlaylists(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return Playlist with the passed id exists for me url', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      req.query.isOwner = true;
      req.user.id = usersIds[0];
      Playlist.select = jest.fn().mockReturnThis();
      Playlist.populate = jest.fn().mockReturnThis();
      Playlist.skip = jest.fn().mockReturnThis();
      Playlist.limit = jest.fn().mockReturnThis();
      Playlist.where = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlists, 'find');
      await playlistController.getUserPlaylists(req, res, next);
      const foundPlaylists = res.json.mock.calls[0][0].items;
      expect(toString(foundPlaylists)).toEqual(toString(playlists));
    });
  });
  describe('createPlaylist - test', () => {
    it('should throw error 404 when url is /api/v1/playlists', async () => {
      req.baseUrl = '/api/v1/playlists';
      await playlistController.createUserPlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.createUserPlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      mockingoose(User).toReturn(null, 'findOne');
      await playlistController.createUserPlaylist(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if user with the passed id exists', async () => {
      req.params.id = usersIds[0];
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      mockingoose(User).toReturn(user, 'findOne');
      await playlistController.createUserPlaylist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
    it('should return 200 if user with the passed id exists when req.file not passed', async () => {
      req.params.id = usersIds[0];
      req.body = {
        name: 'MGZZZ',
        public: true,
        collabrative: true,
        description: 'dfdgfsfdgasd'
      };
      req.file = null;
      mockingoose(User).toReturn(user, 'findOne');
      await playlistController.createUserPlaylist(req, res, next);
      expect(res.status.mock.calls[0][0]).toBe(200);
    });
  });
  describe('deleteTracks - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.deleteTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.deleteTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when no tracks with passed uris', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(null, 'find');
      await playlistController.deleteTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.body = {
        uris: ['hbhjfds']
      };
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Playlist).toReturn(null, 'findOneAndUpdate');
      await playlistController.deleteTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if playlist with the passed id exists after deleting', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      await playlistController.deleteTracks(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });
  });
  describe('addTracks - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.addTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.addTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when no tracks with passed uris', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(null, 'find');
      await playlistController.addTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Playlist).toReturn(null, 'findOne');
      await playlistController.addTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if playlist with the passed id exists after adding Tracks', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      await playlistController.addTracks(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });
  });
  describe('replaceTracks - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.replaceTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.replaceTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when no tracks with passed uris', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(null, 'find');
      await playlistController.replaceTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Playlist).toReturn(null, 'findOne');
      await playlistController.replaceTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if playlist with the passed id exists after adding Tracks', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        uris: ['hbhjfds']
      };
      playlist.save = jest.fn().mockReturnThis();
      mockingoose(Track).toReturn(tracks, 'find');
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      mockingoose(Playlist).toReturn(playlist, 'findOneAndUpdate');
      await playlistController.replaceTracks(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });
  });
  describe('reorderTracks - test', () => {
    it('should throw error 404 when url is has users in it', async () => {
      req.baseUrl = 'api/v1/users/userid/playlists';
      await playlistController.reorderTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when url is has me in it', async () => {
      req.baseUrl = 'api/v1/me/playlists';
      await playlistController.reorderTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should throw error 404 when invalid id is passed', async () => {
      req.params.id = 'invalid';
      req.body = {
        range_start: 0,
        range_length: 1,
        insert_before: 2
      };
      mockingoose(Playlist).toReturn(null, 'findOne');
      await playlistController.reorderTracks(req, res, next);
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
    it('should return 200 if playlist with the passed id exists after adding Tracks', async () => {
      req.params.id = playlistsIds[0];
      req.body = {
        range_start: 0,
        range_length: 1,
        insert_before: 2
      };
      Playlist.save = jest.fn().mockReturnThis();
      mockingoose(Playlist).toReturn(playlist, 'findOne');
      jest.mock('lodash');
      _.times = jest.fn();
      _.times.mockImplementationOnce();
      await playlistController.reorderTracks(req, res, next);
      expect(res.sendStatus.mock.calls[0][0]).toBe(204);
    });
  });
});
