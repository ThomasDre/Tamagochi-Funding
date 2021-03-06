# Coin-Job

## What is Coin-Job
Is a centralised platform where coin-job-tokens (CJTs) are offered. Configurable Schemas of this tokens can be minted by anyone who wants to announce a job-offering. Users can search for these tokens (off-chain, on a marketplace) and can acquire tokens. Once they proclaim a job, they are offered with a token of this particular job-coin-schema.
Once they have the token, they can satisfy the tasks of the job. The Token will automatically  check whether the requirements are fulfilled and reward the user(s) who have accomplished the goal first.

## How can it be used
As a job announcer I want some task to be done. I care about the results and not about intermediate results.
As a job seeker, i am searching for opportunities to contribute and earn money. Perhabs  whole project is too big for me, or I am lacking the required skills to do all parts.

__Here Coin-Job comes into place__ as a job is published as a token. A unique token by job exists which is tradeable among job-seekers. Whoever finishes the job, gains the reward of the job. But it is not required that the same person who started a job eventually finishes the job. One can also sell the token and by doing so also sell all the intermediate results to a person who wants to continue the job.

## Use-Case scenario

Joe wants to have answers to 5 very important questions in his life. He can not find anyone who has enough wisdom and expertise to help him out, therefore joe offers these tasks as a new job. He mints a Coin-Job-Token (a CJT that solely represents his particular job-offer).

Joe configures the token as wished. He specifies the name of the job, the summary, the contract terms (reward, due-date, single-person/multi-person, if multi-person he specifies the totalsupply of his token).
He also has the specify what has to done, and has to provide terms by which possible solutions can be checked:
	- therefore joe creates a contract that does the check, and provides a link/address to this contract in the newly minted token.

Now Joe is done, and Joes CJT is published


Mike needs money very badly but is not very talented and he also likes to browse the net for some random announcements, just in the same way as he likes to browse tinder for girls that are totally out of reach!
Mike sees Joe's announcement and swipes right on his job offering. Now Mike is a proud owner (the first in fact) of Joe's CJT. Joe could have looked at the task right away offchain but he was too eager, therefore he checks the terms-contract that is associated with his token now. He sees that he knows by pure luck 1 of the 5 questions, but as Mike needs more money for a new bottle of JimBeans he pretends to know a seconds question too.

Mike now has 2 options: 
	a) Mike submits a solution and therby asks for a payout. Joe may or may not approve his submission. If Joe approves the submission, then Mike is rewarded with an according reward (as stated in the terms) and the solution is announced and the token is debited from Mikes balance. If Joe does not approve, then Mike remains ownership of his token.
	b) Mike sells his token to someone else, who wants to continue his work. 
	
Mike wants a payout, but Joe is not interested (he declines, it would also be possible that Joe simply ignores the approval). Now Mike wants to sell his token.

Alfred has not yet started the job but is interested in this job. Therefore Alfred would like to buy Mikes token, but obviously he is only interested if he can also take over the intermediate results.

!! 
How to make a secure exchangement of token vs information, so that
 - neither Alfred knows Mikes information beforehand
 - and also that Alfred does not pay something for garbage information
!!
