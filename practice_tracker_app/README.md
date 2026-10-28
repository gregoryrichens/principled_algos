# Practice Tracker

`SCHEDULE.md` asks you to log every problem you attempt, and to do the ones you got wrong again a few days later. Keeping that log in a spreadsheet means you have to work out each morning which problems are due. This small app does that for you.

- **You log each attempt:** the date, the problem, which principle you chose, how it went, and one line about why.
- **Each day it tells you what to redo.** Any problem you failed comes back 1, 3 and 7 days later until you get it right on the 7th day. A problem you solve cleanly comes back once more, 14 days later.

It runs on your own computer. Your log is stored in a PostgreSQL database that also runs on your computer, so nothing goes to the cloud and nothing costs money.

Setup takes about 15 minutes, most of which is installing Docker if you don't have it yet.

---

## How the review schedule works

Every attempt gets one of five **outcomes**:

| Outcome | Meaning | Counts as |
|---|---|---|
| `clean` | Right principle, working code, within the time box | pass |
| `slow` | Right principle and working code, but over the time box | pass |
| `bug` | Right principle, but the code didn't work | **fail** |
| `wrong-principle` | You reached for the wrong idea | **fail** |
| `read-solution` | You had to read the hint or solution | **fail** |

**The rule:** when you fail a problem, it comes back for review **1 day, 3 days and 7 days later**. If you fail any of those reviews, the cycle starts again from that day. If you pass the 7-day review, it comes back once more for a **Day 14** check, 14 days after that pass. A problem you solve `clean` on the first try also comes back 14 days later (a first-try `slow` doesn't). Pass the Day 14 check and the problem is **retired** and leaves your list. Fail it and the 1, 3 and 7 day cycle starts again.

An example. You fail #435 on Monday the 5th (Day 14 here is two weeks after the Day 7 pass):

| Date | What happens |
|---|---|
| Mon 5 | You log `wrong-principle`. #435 is now due on the 6th, 8th and 12th. |
| Tue 6 | It's on your list as **Day 1**. You solve it: `clean`. |
| Thu 8 | It's on your list as **Day 3**. You fail again: `bug`. The cycle restarts, so it's now due on the 9th, 11th and 15th. |
| Fri 9 | **Day 1**: `clean`. |
| Sun 11 | **Day 3**: `clean`. |
| Thu 15 | **Day 7**: `clean`. It's now due once more on the 29th. |
| Thu 29 | **Day 14**: `clean`. #435 is retired. |

Three more things to know:

- **Missed a day?** Nothing is lost. A review stays on your list until you do it, and the list shows how many days overdue it is. If one late attempt covers two reviews (say you do the Day 1 review on day 4), it counts for both. The Day 7 review still falls 7 days after the failure.
- **Redoing a problem too early doesn't count.** If you redo it before its next review is due, the attempt goes into your history but the schedule stays the same. Spacing the reviews out is what makes them work.
- **You don't need to tell the app whether an attempt is a review.** Every attempt goes through the same form and is judged by the same rule.

---

## What you need

- **Git**, to copy the repository. On a Mac, running `git --version` in Terminal will offer to install it if it's missing.
- **Docker Desktop**, which runs the app and its database in isolated "containers", so you don't have to install Node.js or PostgreSQL yourself. Download it from <https://www.docker.com/products/docker-desktop/>, install it and open it once. When the whale icon in your menu bar (Mac) or system tray (Windows) stops animating, Docker is ready. If you had a terminal window open while installing, close it and open a new one so it can find the `docker` command.

To check both are working, open a terminal and run:

```bash
git --version
docker compose version
```

Each should print a version number.

---

## Setup walkthrough

### 1. Fork and clone the repository

On GitHub, press **Fork** on this repository to get your own copy. Then copy it to your computer (replace `YOUR-USERNAME`):

```bash
git clone https://github.com/YOUR-USERNAME/principled_algos.git
cd principled_algos/practice_tracker_app
```

All the commands from here on are run from inside the `practice_tracker_app` folder.

### 2. Set your time zone

The app needs your time zone to know when "today" starts. Copy the example settings file:

```bash
cp .env.example .env
```

Open `.env` in any text editor and change `TZ` to your time zone, for example `TZ=America/New_York` or `TZ=Asia/Singapore` (the file includes a link to the full list). If you skip this step, the app uses UTC, and your list may change over at the wrong hour.

### 3. Start the app

```bash
docker compose up -d --build
```

The first run downloads PostgreSQL and Node.js and builds the app, which takes a few minutes. Later starts take seconds. `-d` runs it in the background so you get your terminal back.

To check both parts are running:

```bash
docker compose ps
```

You should see two services, `db` and `web`, both with status `running` (`db` also says `healthy`).

### 4. Open it

Go to **<http://localhost:8000>**. You should see today's date and the message **Nothing to review today.**

---

## First-use walkthrough

This takes two minutes and shows you that the whole review loop works.

**1. Log a failed attempt dated yesterday.** Click **Log** and fill in:

| Field | Value |
|---|---|
| Date | yesterday's date |
| Problem number | `435` |
| Title | `Non-overlapping Intervals` |
| Chosen principle | `P9 · Sort first` |
| Correct principle | leave as `— (auto from map)` |
| Outcome | `wrong-principle` |
| Invariant / reason | `sorted and merged; this is selection, keep earliest end` |

Press **Save**. You're taken back to **Today**, with two messages:

- `Logged #435 (wrong-principle).`
- `Principle map says P7 for #435: sort, keep earliest end. (P9 is listed as a secondary principle.)`

The app knows the correct principle for each of the NeetCode 150 from `_analysis/principle_map.json`, so you can leave **Correct principle** blank for those problems. For any other problem, fill it in yourself once you know the answer.

**2. Check that it's due.** The Today page now lists **#435 Non-overlapping Intervals** as a **Day 1** review. It shows the principle you chose, the correct one, and your note, so you know what to watch for.

**3. Do the review.** Click **Log attempt** on that row. The problem number and title are filled in for you. Set the outcome to `clean` and save. #435 drops off today's list and will come back as **Day 3**.

**4. Clean up the test entries (optional).** Open **History**. Every row has a **Delete** button. Press it on one of the #435 rows. A popup asks you to confirm, which guards against deleting by accident. Press **OK**, then do the same for the other #435 row. Made a typo? Press **Edit** on any row to fix it instead.

You're set up. From now on, follow `SCHEDULE.md` as usual, and at step 5 of the ritual ("Log one line"), log the attempt here.

---

## Bring in your existing log

If you've been using the Google Sheet template linked in `SCHEDULE.md`:

1. In Google Sheets, choose **File → Download → Comma-separated values (.csv)**.
2. In the tracker, open **Import**, choose the downloaded file and press **Import**.

The file's first row must have these column names. The template already does.

```
Date, Problem, Chosen Principle, Correct Principle, Outcome, Invariant / Reason
```

- **Date** must be written `YYYY-MM-DD`, such as `2026-09-21`.
- **Problem** can be `435`, `#435` or `435. Non-overlapping Intervals`.
- **Principles** can be `P7` or `7`, or left blank.
- **Outcome** must be one of the five outcomes above.

If any row has a problem, **nothing** is imported. Instead you get a list of every bad row with its row number, so you can fix them in the sheet and try again. It's safe to import the same file twice, because rows that are already in the database are skipped.

Old failures are scheduled like new ones. A failure from three weeks ago that you never reviewed shows up as an overdue **Day 1** review.

---

## Everyday commands

Run these from the `practice_tracker_app` folder.

| To… | Run |
|---|---|
| Start the tracker | `docker compose up -d` |
| Stop it (your data is kept) | `docker compose stop` |
| See whether it's running | `docker compose ps` |
| See error messages | `docker compose logs web` |
| Update after pulling new code | `git pull` then `docker compose up -d --build` |

The tracker restarts on its own when Docker Desktop starts, unless you stopped it with `docker compose stop`. If Docker Desktop opens when you log in, the tracker is always ready at <http://localhost:8000>.

---

## Your data

Your log is kept in a Docker **volume** named `practice-tracker_pgdata`. A volume is a storage area that Docker manages, separate from the code. It survives stopping, restarting and rebuilding the app.

**Back it up** by writing the whole database to a file:

```bash
docker compose exec -T db pg_dump -U tracker tracker > tracker-backup.sql
```

**Restore a backup** onto a fresh, empty database. Start only the database, load the file, then start the app:

```bash
docker compose down -v          # deletes the current data. Back up first!
docker compose up -d --wait db
docker compose exec -T db psql -U tracker tracker < tracker-backup.sql
docker compose up -d
```

**Look at the raw data** with PostgreSQL's own command-line tool:

```bash
docker compose exec db psql -U tracker tracker
```

Then try `SELECT attempted_on, problem, outcome, note FROM attempts ORDER BY attempted_on DESC LIMIT 10;` and type `\q` to leave.

**Start over with an empty log:** `docker compose down -v`. The `-v` deletes the volume, which means **all of your logged attempts**. Back up first.

---

## Troubleshooting

**"port is already allocated" when starting.** Something else on your computer is using port 8000. Set `TRACKER_PORT=8001` in `.env`, run `docker compose up -d` again and use <http://localhost:8001>.

**"Cannot connect to the Docker daemon".** Docker Desktop isn't running. Open it, wait for the whale icon to settle, and try again.

**The date on the Today page is wrong, or the list changes at an odd hour.** `TZ` in `.env` isn't set to your time zone. Fix it, then run `docker compose up -d` to apply it.

**The page doesn't load right after starting.** The database takes a few seconds to get ready on the first start. Wait ten seconds and refresh. If it still fails, run `docker compose logs web` to see the error.

**Import says "Missing column".** The first row of your file doesn't have one of the six column names. Check the spelling, including `Invariant / Reason`, which has spaces around the slash.

---

## Running the tests

The rules for scheduling and importing have automated tests. To run them:

```bash
docker compose --profile test run --rm --build test
```

The tests use their own database, `tracker_test`, so they never touch your log.
