<!-- Title suggestion: [Onboarding] Newcomer's name -->

# Welcome to Mythic Table's QA Team!
We hope you're as excited as we are to be part of this project! The QA Process is VERY important to us. Please keep in mind that we are all learning, so please ask as many questions as you like!

This is Phase 1 of the QA on boarding and it is meant to serve as the bare minimum needed to be effective in the QA role

## Where to QA

All QA will take place in three main areas:

1. [ ] Log into [Edge](https://edge.mythictable.com)
1. [x] Make sure you're in Slack (probably done)
1. [x] Log into [GitLab](https://gitlab.com/mythicteam/mythictable) (How are you here if this isn't done?)

## How to QA

There are two promary roles a QA team member will be responsilbe for:

### 1. Confirming issues are done

This is done by going to the GitLab Review Section and seeing if there is anything that needs to be reviewed.

- [ ] Open Gitlab
- [ ] Go to Issues
- [ ] Open Boards
- [ ] Go to the current Board
- [ ] Take the first available `phase::review` issue
- [ ] Report in the Slack #qa channel that you're reviewing it
- [ ] Go through the [Acceptance Criteria](https://gitlab.com/mythicteam/mythictable/-/wikis/qa/acceptance-criteria) and make sure everything is done
- [ ] If everything is done, the issue can be `closed`
- [ ] If not, you can put in a note and send it back to `phase::active`

### 2. Finding new bugs

Finding new bugs is mostly straight forward. While using the platform you might notice things you don't like. Those are probably bugs.

- [ ] Go to [Edge](https://edge.mythictable.com) or FP [FP](https://fp.mythictable.com)
- [ ] Find a bug
- [ ] Search for open bugs to see if it already exists
- [ ] If not, create it
- [ ] Go into #dev and let the team know you've logged a new bug

## Creating bugs

More details can be found here: [(how-to/make issues)](https://gitlab.com/mythicteam/mythictable/-/wikis/how-to/make-issues)

- [ ] Open Gitlab
- [ ] Go to Issues
- [ ] Click 'New Issue`
- [ ] Use the Template Dropdown to chose `Bug`
- [ ] Fill out all the sections
- [ ] Name it well enough that we can search it easily

## Closing Issues

Only QA can approve an issue as closed. It is assumed that everything, within reason, was tested around a given issue.
If no problems were found that issue can be closed. We close issues by doing the following:

- [ ] Verify it is finished
- [ ] Open Gitlab
- [ ] Go to Issues
- [ ] Open Boards
- [ ] Go to the current Board
- [ ] Drag the issue to the closed column

If you are already in the issue, you can close it by hitting the `Close Issue` button. If you do that, be sure to remove the `phase::review` label.

### Celebrate

Closing issues is a big deal for Mythic Table. When it's done, we like to make a call out to the developers that worked on it in the
#mythigtable channel in Slack.

- [ ] Celebrate the issue was closed in #mythictable

## Closing Your Onboarding

To close your onboarding, you need to make sure all items in this ticket are checked and that you feel confident as a QA team member.

Welcome aboard!

/label ~"type::onboarding"
