/* Course map: the clickable tree of every method in the course.
   Node fields: t short label, f full name, wk week key, g glossary search text,
   d plain definition, e key equation (TeX), u when to use or exam tip,
   q true for a question node, edge label on the branch into this node, k children. */
window.CMAP = {
  t: 'RL', f: 'Reinforcement Learning', wk: 'w1', g: 'reinforcement learning',
  d: 'An **agent** learns by trial and error which **actions** to take in each **state** of an **environment**, so that the total **reward** it collects over time is as large as possible.',
  e: 'G_t = R_{t+1} + \\gamma R_{t+2} + \\gamma^2 R_{t+3} + \\dots',
  u: 'Every method below maximises the expected return $G_t$. They differ in what they know about the world and what they learn.',
  k: [
    { q: true, t: 'What does the problem look like?', d: 'Start every "which method?" answer here. The deciding property is what makes the choice, so say it out loud.', k: [

      { edge: 'one state, repeat a choice', t: 'Bandits', f: 'Multi-armed bandit', wk: 'w2', g: 'multi-armed bandit',
        d: 'One situation, several slot machines. Each pull gives a random reward, and you must balance trying arms (**exploration**) with pulling the best one so far (**exploitation**). No states, so actions do not change the future.',
        e: 'Q_{n+1} = Q_n + \\tfrac{1}{n}\\,(R_n - Q_n)',
        u: 'Use when your action does not change the situation, for example picking which advert to show.',
        k: [
          { t: '\u03b5-greedy', f: 'Epsilon-greedy action selection', wk: 'w2', g: 'greedy', d: 'Pick the best-looking arm most of the time, and a random arm with small probability $\\varepsilon$.', e: 'A_t = \\begin{cases} \\arg\\max_a Q(a) & \\text{prob } 1-\\varepsilon \\\\ \\text{random } a & \\text{prob } \\varepsilon \\end{cases}', u: 'Simplest exploration rule. Also used inside SARSA, Q-learning and DQN.' },
          { t: 'UCB', f: 'Upper Confidence Bound', wk: 'w2', g: 'upper confidence bound', d: 'Add a bonus to arms you have tried only a few times, so uncertainty itself attracts exploration. The bonus shrinks as an arm is tried more.', e: 'A_t = \\arg\\max_a \\Big[ Q_t(a) + c\\sqrt{\\tfrac{\\ln t}{N_t(a)}} \\Big]', u: 'Explores smarter than random. The same idea drives UCT in MCTS.' },
          { t: 'Contextual bandit', f: 'Contextual bandit', wk: 'w2', g: 'contextual bandit', d: 'A bandit that first sees a clue (the context), like which user is visiting, but its action still does not change the next situation.', u: 'Sits between bandits and full RL.' }
        ] },

      { edge: 'many states, fully observed', q: true, t: 'Do you know the model $p(s\',r \\mid s,a)$?', wk: 'w3', g: 'markov decision process',
        d: 'The problem is an **MDP (Markov Decision Process)**: states, actions, transition probabilities, rewards and a discount $\\gamma$. The **model** is the transition and reward rule. Knowing it decides between planning and learning.',
        k: [
          { edge: 'yes, and I can sweep every state', t: 'DP', f: 'Dynamic Programming', wk: 'w5', g: 'dynamic programming',
            d: 'Use the known model to compute values exactly, by repeatedly applying the **Bellman equation** to every state. Planning without acting.',
            e: 'v_\\pi(s) = \\sum_a \\pi(a \\mid s) \\sum_{s\',r} p(s\',r \\mid s,a)\\,[\\,r + \\gamma\\, v_\\pi(s\')\\,]',
            u: 'Model-based, bootstraps, no sampling. Fails when the state space is huge (curse of dimensionality).',
            k: [
              { t: 'Policy evaluation', f: 'Iterative policy evaluation (prediction)', wk: 'w5', g: 'policy evaluation', d: 'Work out how good a fixed policy is by sweeping the Bellman expectation equation until the values stop changing.', e: 'v_{k+1}(s) = \\sum_a \\pi(a \\mid s) \\sum_{s\',r} p(s\',r \\mid s,a)\\,[\\,r + \\gamma\\, v_k(s\')\\,]', u: 'Answers the **prediction** problem.' },
              { t: 'PI', f: 'Policy Iteration', wk: 'w5', g: 'policy iteration', d: 'Alternate two steps until the policy stops changing: evaluate the current policy fully, then make it greedy with respect to those values.', e: '\\pi_0 \\xrightarrow{E} v_{\\pi_0} \\xrightarrow{I} \\pi_1 \\xrightarrow{E} v_{\\pi_1} \\xrightarrow{I} \\dots \\to \\pi_*', u: 'Few iterations, but each one is expensive. Converges by the policy improvement theorem.' },
              { t: 'VI', f: 'Value Iteration', wk: 'w5', g: 'value iteration', d: 'Skip full evaluation. Every sweep applies the Bellman **optimality** equation, taking the best action straight away.', e: 'v_{k+1}(s) = \\max_a \\sum_{s\',r} p(s\',r \\mid s,a)\\,[\\,r + \\gamma\\, v_k(s\')\\,]', u: 'Cheaper sweeps than PI. Read the policy off at the end with one greedy step.' },
              { t: 'Async DP', f: 'Asynchronous (in-place) Dynamic Programming', wk: 'w5', g: 'asynchronous dp', d: 'Update states one at a time in any order, using new values immediately, instead of a full synchronous sweep.', u: 'Often converges faster and lets you focus on important states.' },
              { t: 'GPI', f: 'Generalised Policy Iteration', wk: 'w5', g: 'generalised policy iteration', d: 'The pattern behind almost every method: keep evaluating and improving a policy, in any mix, until both settle.', u: 'Say "every control method is GPI with a different evaluation step". It ties the course together.' }
            ] },
          { edge: 'yes or a simulator, but too big to sweep', t: 'Online planning', f: 'Sample-based online planning', wk: 'w11', g: 'online planning',
            d: 'Plan only from the state you are in now, using the model or simulator to imagine what happens next. Then act, and plan again.',
            u: 'Use for huge problems such as Go, where computing every state is impossible.',
            k: [
              { t: 'ExpectiMax', f: 'ExpectiMax tree search', wk: 'w11', g: 'expectimax', d: 'A lookahead tree: take the max at your decisions and the probability-weighted average at chance events.', e: 'V(\\text{chance}) = \\sum_{s\'} p(s\')\\,V(s\'), \\qquad V(\\text{decision}) = \\max_a V(a)', u: 'Exact but grows exponentially with depth.' },
              { t: 'MCTS', f: 'Monte Carlo Tree Search', wk: 'w11', g: 'monte carlo tree search', d: 'Grow a search tree from the current state by repeating four steps thousands of times: **selection**, **expansion**, **simulation** (rollout) and **backpropagation**.', u: 'Anytime algorithm. Backs up real rollout returns, so plain MCTS does not bootstrap.',
                k: [
                  { t: 'UCT', f: 'Upper Confidence bounds applied to Trees', wk: 'w11', g: 'uct', d: 'The tree policy inside MCTS: pick the child with the best average result plus an exploration bonus, which is UCB used at every node.', e: 'a^* = \\arg\\max_a \\Big[ Q(s,a) + c\\sqrt{\\tfrac{\\ln N(s)}{N(s,a)}} \\Big]', u: 'Balances exploiting good moves and checking rarely tried ones.' }
                ] },
              { t: 'AlphaZero', f: 'AlphaZero (MCTS with a policy and value network)', wk: 'w11', g: 'alphazero', d: 'MCTS guided by a neural network that suggests promising moves (policy head) and judges positions (value head). The network learns from the search results through **self-play**.', u: 'Bootstraps, because leaf values come from the value network instead of rollouts.' }
            ] },
          { edge: 'no, but I can learn one', t: 'Model-based RL', f: 'Model-based Reinforcement Learning (Dyna)', wk: 'w11', g: 'model learning',
            d: 'Learn the model from real experience, then use it to generate extra simulated experience for planning. **Dyna-Q** does one real step, then several imagined steps from the learned model.',
            u: 'Much more sample efficient. Risk: errors in the learned model compound and get exploited.' },
          { edge: 'no, learn straight from experience', t: 'Model-free RL', f: 'Model-free Reinforcement Learning', wk: 'w1', g: 'model-free',
            d: 'Never learn the rules of the world. Learn values or a policy directly from sampled experience.',
            u: 'Learns $Q(s,a)$ for control, because $V(s)$ alone needs a model to pick actions.',
            k: [
              { q: true, t: 'Does the state fit in a table?', wk: 'w8', g: 'function approximation', d: 'A table has one entry per state (or state-action pair). If there are too many states, or they are continuous, you need a formula that generalises instead.', k: [
                { edge: 'yes, tabular', t: 'MC', f: 'Monte Carlo methods', wk: 'w6', g: 'monte carlo (mc) methods',
                  d: 'Play a whole episode, then update each visited state towards the actual return. No bootstrapping.',
                  e: 'V(S_t) \\leftarrow V(S_t) + \\alpha\\,[\\,G_t - V(S_t)\\,]',
                  u: 'Unbiased, high variance. Needs episodes that end.',
                  k: [
                    { t: 'First / every-visit MC', f: 'First-visit and every-visit Monte Carlo prediction', wk: 'w6', g: 'first-visit', d: 'First-visit averages the return from the first time a state appears in each episode. Every-visit averages all appearances.', u: 'Both converge to $v_\\pi(s)$.' },
                    { t: 'MC control', f: 'Monte Carlo control (exploring starts, \u03b5-soft, GLIE)', wk: 'w6', g: 'glie', d: 'GPI with MC evaluation of $Q(s,a)$. Keeps exploring with exploring starts or an $\\varepsilon$-soft policy. **GLIE (Greedy in the Limit with Infinite Exploration)** guarantees convergence.', e: '\\varepsilon_k = 1/k', u: 'On-policy MC control.' },
                    { t: 'Off-policy MC', f: 'Off-policy Monte Carlo with importance sampling', wk: 'w6', g: 'importance sampling', d: 'Learn about a target policy $\\pi$ from data made by a behaviour policy $b$, by re-weighting each return with the **importance sampling ratio**.', e: '\\rho_{t:T-1} = \\prod_{k=t}^{T-1} \\frac{\\pi(A_k \\mid S_k)}{b(A_k \\mid S_k)}', u: 'Ordinary IS is unbiased but high variance. Weighted IS is biased but steadier.' }
                  ] },
                { edge: 'yes, tabular', t: 'TD', f: 'Temporal-Difference learning', wk: 'w7', g: 'temporal-difference',
                  d: 'Update after every step, towards the reward plus your own estimate of the next state. Learns during the episode by **bootstrapping**.',
                  e: '\\delta_t = R_{t+1} + \\gamma V(S_{t+1}) - V(S_t)',
                  u: 'Lower variance than MC, some bias. Works on continuing tasks.',
                  k: [
                    { t: 'TD(0)', f: 'One-step Temporal-Difference prediction', wk: 'w7', g: 'td(0)', d: 'Evaluate a policy by nudging $V(S_t)$ towards the one-step TD target.', e: 'V(S_t) \\leftarrow V(S_t) + \\alpha\\,[\\,R_{t+1} + \\gamma V(S_{t+1}) - V(S_t)\\,]', u: 'Prediction, on-policy.' },
                    { t: 'n-step and TD(\u03bb)', f: 'n-step returns and the \u03bb-return', wk: 'w10', g: 'n-step return', d: 'Look $n$ real steps ahead before bootstrapping, or blend all $n$ with weights $(1-\\lambda)\\lambda^{n-1}$. A dial between TD ($\\lambda=0$) and MC ($\\lambda=1$).', e: 'G_t^{\\lambda} = (1-\\lambda)\\sum_{n=1}^{\\infty} \\lambda^{n-1} G_{t:t+n}', u: 'Same dial appears in GAE.' },
                    { t: 'SARSA', f: 'State, Action, Reward, next State, next Action', wk: 'w7', g: 'sarsa', d: 'On-policy TD control. Updates towards the value of the action it will actually take next, including exploratory ones.', e: 'Q(S,A) \\leftarrow Q(S,A) + \\alpha\\,[\\,R + \\gamma Q(S\',A\') - Q(S,A)\\,]', u: 'Safer while exploring (the cliff walk route away from the edge).' },
                    { t: 'Q-learning', f: 'Q-learning (off-policy TD control)', wk: 'w7', g: 'q-learning', d: 'Updates towards the best next action, whatever it actually does, so it learns the greedy policy while behaving $\\varepsilon$-greedily.', e: 'Q(S,A) \\leftarrow Q(S,A) + \\alpha\\,[\\,R + \\gamma \\max_{a} Q(S\',a) - Q(S,A)\\,]', u: 'Off-policy. Suffers maximisation bias.' },
                    { t: 'Expected SARSA', f: 'Expected SARSA', wk: 'w7', g: 'expected sarsa', d: 'Uses the average over next actions, weighted by the policy, instead of one sampled next action.', e: 'Q(S,A) \\leftarrow Q(S,A) + \\alpha\\,[\\,R + \\gamma \\textstyle\\sum_a \\pi(a \\mid S\')\\,Q(S\',a) - Q(S,A)\\,]', u: 'Lower variance than SARSA. Becomes Q-learning when $\\pi$ is greedy.' },
                    { t: 'Double Q', f: 'Double Q-learning', wk: 'w7', g: 'double q-learning', d: 'Two tables: one picks the best next action, the other scores it. Removes the overestimate caused by taking a max over noisy values.', e: 'Q_1(S,A) \\leftarrow Q_1(S,A) + \\alpha\\,[\\,R + \\gamma Q_2\\big(S\', \\arg\\max_a Q_1(S\',a)\\big) - Q_1(S,A)\\,]', u: 'Fixes maximisation bias.' }
                  ] },
                { edge: 'no, too big or continuous', q: true, t: 'Discrete actions, or continuous / stochastic?', wk: 'w10', g: 'policy-based', d: 'With a few discrete actions you can take a max over $Q$. With continuous actions you cannot list them, so learn the policy directly.', k: [
                  { edge: 'discrete actions', t: 'VFA', f: 'Value Function Approximation', wk: 'w8', g: 'value function approximation',
                    d: 'Replace the table with a function $\\hat v(s,\\mathbf w)$ or $\\hat q(s,a,\\mathbf w)$ with weights $\\mathbf w$, trained by stochastic gradient descent.',
                    e: '\\mathbf w \\leftarrow \\mathbf w + \\alpha\\,[\\,R + \\gamma \\hat v(S\',\\mathbf w) - \\hat v(S,\\mathbf w)\\,]\\,\\nabla \\hat v(S,\\mathbf w)',
                    u: 'Semi-gradient: the target also depends on $\\mathbf w$ but is treated as fixed. Watch the deadly triad.',
                    k: [
                      { t: 'Linear VFA', f: 'Linear function approximation with features', wk: 'w8', g: 'linear function approximation', d: 'Value is a weighted sum of features. Features come from **tile coding**, coarse coding, **RBF (Radial Basis Functions)**, Fourier or polynomial bases, or state aggregation.', e: '\\hat v(s,\\mathbf w) = \\mathbf w^\\top \\mathbf x(s)', u: 'Cheap and stable on-policy. Converges to the TD fixed point.' },
                      { t: 'Gradient MC / semi-gradient TD', f: 'Gradient Monte Carlo and semi-gradient TD', wk: 'w8', g: 'semi-gradient', d: 'Gradient MC regresses onto the real return $G_t$, a true gradient method. Semi-gradient TD regresses onto a bootstrapped target, faster but only a partial gradient.', u: 'Semi-gradient SARSA with tile coding solves Mountain Car.' },
                      { t: 'LSTD', f: 'Least-Squares Temporal Difference', wk: 'w8', g: 'lstd', d: 'Collect the data, then solve directly for the TD fixed point instead of taking many small steps.', e: '\\mathbf w_{TD} = \\mathbf A^{-1}\\mathbf b', u: 'Most data efficient, cost grows with the square of the number of features.' },
                      { t: 'DQN', f: 'Deep Q-Network', wk: 'w9', g: 'deep q-network', d: 'A neural network (a CNN for pixels) outputs $Q(s,a)$ for every action. Made stable by **experience replay** and a frozen **target network**.', e: 'L(\\mathbf w) = \\big(\\,r + \\gamma \\max_{a\'} Q(s\',a\';\\mathbf w^-) - Q(s,a;\\mathbf w)\\,\\big)^2', u: 'Off-policy, bootstrapped, deep: all three of the deadly triad, which is why the two tricks are needed.',
                        k: [
                          { t: 'Double DQN', f: 'Double Deep Q-Network', wk: 'w9', g: 'double dqn', d: 'The online network picks the next action, the target network scores it.', e: 'y = r + \\gamma\\, Q\\big(s\', \\arg\\max_{a\'} Q(s\',a\';\\mathbf w);\\ \\mathbf w^-\\big)', u: 'Fixes overestimation.' },
                          { t: 'Dueling DQN', f: 'Dueling Deep Q-Network', wk: 'w9', g: 'dueling dqn', d: 'Splits the network into a state value stream and an advantage stream, then recombines them.', e: 'Q(s,a) = V(s) + A(s,a) - \\tfrac{1}{|\\mathcal A|}\\textstyle\\sum_{a\'} A(s,a\')', u: 'Learns state values even for actions rarely taken.' },
                          { t: 'PER', f: 'Prioritised Experience Replay', wk: 'w9', g: 'prioritised replay', d: 'Replay surprising transitions (large TD error) more often, with importance weights to correct the bias.', e: 'P(i) \\propto |\\delta_i|^{\\alpha}', u: 'Faster learning from the same buffer.' }
                        ] }
                    ] },
                  { edge: 'continuous or stochastic actions', t: 'Policy gradient', f: 'Policy-based RL (policy gradient methods)', wk: 'w10', g: 'policy gradient',
                    d: 'Learn the policy $\\pi_\\theta(a \\mid s)$ directly and climb the gradient of the expected return. Works with continuous actions (Gaussian policy) and stochastic policies (softmax).',
                    e: '\\nabla_\\theta J(\\theta) = \\mathbb E_\\pi\\big[\\,\\nabla_\\theta \\ln \\pi_\\theta(A \\mid S)\\; Q^\\pi(S,A)\\,\\big]',
                    u: 'Policy gradient theorem: no model needed, only the moves made and how they went.',
                    k: [
                      { t: 'REINFORCE', f: 'REINFORCE (Monte Carlo policy gradient)', wk: 'w10', g: 'reinforce', d: 'After each episode, push up the probability of every action in proportion to the return that followed it. A **baseline** $b(s)$ cuts the variance without adding bias.', e: '\\theta \\leftarrow \\theta + \\alpha\\,\\big(G_t - b(S_t)\\big)\\,\\nabla_\\theta \\ln \\pi_\\theta(A_t \\mid S_t)', u: 'Unbiased, very noisy. The baseline is not a critic, because it never bootstraps.' },
                      { t: 'Actor-critic', f: 'Actor-critic methods', wk: 'w10', g: 'actor-critic', d: 'The **actor** is the policy. The **critic** learns $V(s)$ and scores each action with the TD error, a cheap estimate of the **advantage**.', e: '\\delta_t = R_{t+1} + \\gamma V(S_{t+1}) - V(S_t) \\approx A(S_t,A_t)', u: 'Lower variance than REINFORCE, learns every step.',
                        k: [
                          { t: 'A2C / A3C', f: 'Advantage Actor-Critic / Asynchronous Advantage Actor-Critic', wk: 'w10', g: 'a2c', d: 'A2C collects synchronous batches from several environment copies. A3C runs workers in parallel that update a shared network without waiting for each other.', u: 'A3C is the asynchronous one. PPO is synchronous.' },
                          { t: 'GAE', f: 'Generalised Advantage Estimation', wk: 'w10', g: 'gae', d: 'Blend TD errors over many steps with weight $(\\gamma\\lambda)^l$ to trade bias against variance in the advantage estimate.', e: '\\hat A_t = \\sum_{l=0}^{\\infty} (\\gamma\\lambda)^l\\, \\delta_{t+l}', u: '$\\lambda = 0$ is one-step TD, $\\lambda = 1$ is the Monte Carlo advantage.' },
                          { t: 'TRPO', f: 'Trust Region Policy Optimisation', wk: 'w10', g: 'trpo', d: 'Improve the policy as much as possible while keeping the new one within a small **KL divergence** of the old one.', e: '\\max_\\theta\\ \\mathbb E\\big[r_t(\\theta)\\hat A_t\\big] \\ \\text{ s.t. } \\ \\mathbb E\\big[\\mathrm{KL}(\\pi_{\\text{old}} \\,\\|\\, \\pi_\\theta)\\big] \\le \\delta', u: 'Stable but complicated (second-order).' },
                          { t: 'PPO', f: 'Proximal Policy Optimisation', wk: 'w10', g: 'ppo', d: 'TRPO made simple: clip the probability ratio so one update cannot move the policy too far.', e: '\\begin{gathered} L^{CLIP} = \\mathbb E\\big[\\min\\big(r_t\\hat A_t,\\ \\mathrm{clip}(r_t, 1-\\epsilon, 1+\\epsilon)\\hat A_t\\big)\\big] \\\\ r_t = \\frac{\\pi_\\theta(a_t \\mid s_t)}{\\pi_{\\text{old}}(a_t \\mid s_t)} \\end{gathered}', u: 'The default. Used in RLHF and in your drone project.' },
                          { t: 'DDPG / SAC', f: 'Deep Deterministic Policy Gradient / Soft Actor-Critic', wk: 'w10', d: 'Off-policy actor-critics for continuous actions whose critic learns $Q(s,a)$. SAC adds an entropy bonus to keep exploring.', u: 'Beyond the weekly notes. Mention SAC as the main untested rival to PPO in your project.' }
                        ] }
                    ] }
                ] }
              ] }
            ] }
        ] },

      { edge: 'state partly hidden', t: 'POMDP', f: 'Partially Observable Markov Decision Process', wk: 'w2', g: 'pomdp',
        d: 'The agent only gets observations, not the full state, so two different situations can look the same. It must remember or infer, using a **belief state**, a stack of past frames, or a recurrent network.',
        u: 'Your drone is a POMDP: the ring looks the same from both sides and disappears from view. Memory fixed it.' },

      { edge: 'no reward, only preferences', t: 'RLHF', f: 'Reinforcement Learning from Human Feedback', wk: 'w11', g: 'rlhf',
        d: 'When the goal is hard to write as a formula, learn a reward from people comparing answers, then optimise against it with RL.',
        e: '\\max_\\theta\\ \\mathbb E\\big[r_\\phi(x,y)\\big] - \\beta\\, \\mathrm{KL}\\big(\\pi_\\theta \\,\\|\\, \\pi_{\\text{SFT}}\\big)',
        u: 'The KL penalty limits reward hacking.',
        k: [
          { t: 'SFT', f: 'Supervised Fine-Tuning', wk: 'w11', g: 'supervised fine-tuning', d: 'Fine-tune the pre-trained model on example answers written by people.', u: 'Step 2 of 4.' },
          { t: 'RM', f: 'Reward Model', wk: 'w11', g: 'reward model', d: 'A model trained on human rankings to predict which answer people prefer.', e: 'P(y_w \\succ y_l) = \\sigma\\big(r_\\phi(x,y_w) - r_\\phi(x,y_l)\\big)', u: 'Step 3 of 4. Then PPO optimises against it.' },
          { t: 'IRL', f: 'Inverse Reinforcement Learning', wk: 'w2', g: 'inverse rl', d: 'Watch an expert and infer the reward function that explains their behaviour.', u: 'Related idea: recover the reward, then learn from it.' }
        ] },

      { edge: 'long task with sub-goals', t: 'HRL', f: 'Hierarchical Reinforcement Learning (options)', wk: 'w2', g: 'hierarchical rl',
        d: 'Split a long task into sub-skills (**options**) and learn a manager that chooses which skill to run.',
        u: 'Your drone tried this with entry and loop specialists. It lost to the all-rounder trained 15 times longer.' }
    ] }
  ]
};
