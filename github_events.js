'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var events = {};

exports.events = events;
// Username with gravatar
events.UserName = {
  view: function view(ctrl, args) {
    return m('a', { href: ghUrl + args.event.actor.login }, [m('img', { src: args.event.actor.avatar_url, width: 20, 'class': 'img-rounded', hspace: 6 }), args.event.actor.login, ' ']);
  }
};

events.CreateEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "created ", args.event.payload.ref_type, " ", m('a', { href: ghUrl + args.event.repo.name + "/tree/" + args.event.payload.ref }, args.event.payload.ref)]);
  }
};

events.DeleteEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "deleted ", args.event.payload.ref_type, " ", args.event.payload.ref]);
  }
};

events.ForkEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "forked"]);
  }
};

events.GollumEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), args.event.payload.pages.map(function (page) {
      return [page.action, ' ', m('a', { href: ghUrl + page.html_url }, page.title)];
    })]);
  }
};

events.IssueCommentEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' commented on issue ', m('a', { href: args.event.payload.comment.html_url }, ['#', args.event.payload.issue.number])]);
  }
};

events.IssuesEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' ', args.event.payload.action, ' issue ', m('a', { href: args.event.payload.issue.html_url }, ['#', args.event.payload.issue.number])]);
  }
};

events.PullRequestEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' ', args.event.payload.action, ' pull request ', m('a', { href: args.event.payload.pull_request.html_url }, ['#', args.event.payload.pull_request.number])]);
  }
};

events.PullRequestReviewCommentEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' commented on pull request ', m('a', { href: args.event.payload.comment.html_url }, ['#', args.event.payload.pull_request.number])]);
  }
};

events.PushEvent = {
  view: function view(ctrl, args) {
    var numOfCommits = args.event.payload.commits.length;
    return m('span', [m.component(UserName, { event: args.event }), ' pushed ', numOfCommits.toString(), ' commit' + (numOfCommits == 1 ? '' : 's')]);
  }
};

events.WatchEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "starred"]);
  }
};