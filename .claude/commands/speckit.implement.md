---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Learning Mode Parameters

Parse the following flags from user input:

| Flag | Description | Default |
|------|-------------|---------|
| `--learn` | 完整學習模式：執行前教學 + 執行後報告 | **預設啟用** |
| `--learn-brief` | 簡潔學習模式：僅顯示關鍵概念 | - |
| `--no-learn` | 禁用學習模式：純執行，無教學內容 | - |
| `--export-report` | 結束後匯出完整學習報告 | - |

Set `LEARNING_MODE` variable:
- `full` (default or `--learn`)
- `brief` (`--learn-brief`)
- `none` (`--no-learn`)

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ```

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 3

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 3

3. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

4. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

5. Parse tasks.md structure and extract:
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

6. **Contract Task Detection** (合約任務偵測):

   Scan tasks for contract-related keywords to enable learning mode:

   **Detection Keywords**:
   - File paths: `contracts/`, `.move`, `Move.toml`
   - Move syntax: `module`, `entry fun`, `public fun`, `struct`, `has key`, `has store`
   - Domain terms: `mint`, `burn`, `transfer`, `Coin`, `NFT`, `Treasury`, `TxContext`

   **If contract tasks detected**:
   - Set `CONTRACT_LEARNING_MODE = true`
   - Build `CONTRACT_TASKS` mapping:
     ```
     CONTRACT_TASKS = {
       task_id: {
         module: "mgc" | "check_in" | "oracle_draw" | "oracle_nft",
         concepts: ["Object Model", "Coin Standard", ...],
         security_topics: ["權限控制", "重入攻擊", ...]
       }
     }
     ```
   - Initialize learning report at `FEATURE_DIR/learning/session-[timestamp].md`

   **Concept Mapping Table**:

   | Module | Core Concepts | Security Topics |
   |--------|--------------|-----------------|
   | mgc.move | Coin Standard, TreasuryCap, OTW | 權限控制, 總量管理 |
   | check_in.move | Entry Functions, Events, Time | 時間操控, 重複呼叫 |
   | oracle_draw.move | Object Ownership, Coin Transfer | 隨機公平性, 資產安全 |
   | oracle_nft.move | Display Standard, Destruction | NFT 安全, Metadata |

7. **Pre-Implementation Learning** (執行前教學):

   **When**: `CONTRACT_LEARNING_MODE = true` AND `LEARNING_MODE != none` AND task is in `CONTRACT_TASKS`

   For each contract task, BEFORE execution:

   a. **Invoke contract-tutor Agent** with task context:
      - Task ID and description
      - Target file paths
      - Mapped concepts and security topics
      - Request: "pre-implementation teaching"

   b. **Display teaching content**:
      ```
      ═══════════════════════════════════════════════════════════════
      📚 學習時刻：[任務名稱]
      ═══════════════════════════════════════════════════════════════

      ## 核心概念
      [Agent 提供的概念解釋]

      ## 設計決策
      [為什麼要這樣設計]

      ## 程式碼預覽
      [即將實作的程式碼結構]

      ## 常見陷阱
      [需要避免的錯誤]
      ═══════════════════════════════════════════════════════════════
      ```

   c. **User interaction** (when `LEARNING_MODE = full`):
      - Ask: "準備好了嗎？請選擇：[yes/skip/explain more]"
      - `yes` → Continue to execution
      - `skip` → Skip teaching, proceed to execution
      - `explain more` → Request deeper explanation from Agent, then ask again

   d. **Brief mode** (`LEARNING_MODE = brief`):
      - Display only: 核心概念 + 常見陷阱
      - Auto-proceed without asking

8. Execute implementation following the task plan:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding

9. **Post-Implementation Learning Report** (執行後報告):

   **When**: `CONTRACT_LEARNING_MODE = true` AND `LEARNING_MODE != none` AND task was in `CONTRACT_TASKS`

   After EACH contract task completion:

   a. **Invoke contract-tutor Agent** with:
      - Task ID and completion status
      - Files modified/created
      - Request: "post-implementation review"

   b. **Display review content**:
      ```
      ═══════════════════════════════════════════════════════════════
      📝 實作報告：[任務名稱]
      ═══════════════════════════════════════════════════════════════

      ## 實作摘要
      - 修改/新增的檔案：[列表]
      - 實作的功能：[說明]

      ## 概念強化
      [回顧使用的核心概念]

      ## 安全性檢查
      | 檢查項目 | 狀態 | 說明 |
      |----------|------|------|
      | 權限控制 | ✓/⚠️ | ... |
      | 資產安全 | ✓/⚠️ | ... |

      ## 測試建議
      1. [測試案例建議]
      ═══════════════════════════════════════════════════════════════
      ```

   c. **Update learning report** (即時累積):
      - Append task learning to `FEATURE_DIR/learning/session-[timestamp].md`
      - Update concepts covered count
      - Track security checks passed/warned

   d. **Brief mode** (`LEARNING_MODE = brief`):
      - Display only: 安全性檢查結果
      - Still update learning report

10. Implementation execution rules:
    - **Setup first**: Initialize project structure, dependencies, configuration
    - **Tests before code**: If you need to write tests for contracts, entities, and integration scenarios
    - **Core development**: Implement models, services, CLI commands, endpoints
    - **Integration work**: Database connections, middleware, logging, external services
    - **Polish and validation**: Unit tests, performance optimization, documentation

11. Progress tracking and error handling:
    - Report progress after each completed task
    - Halt execution if any non-parallel task fails
    - For parallel tasks [P], continue with successful tasks, report failed ones
    - Provide clear error messages with context for debugging
    - Suggest next steps if implementation cannot proceed
    - **IMPORTANT** For completed tasks, make sure to mark the task off as [X] in the tasks file.

12. **Learning Session Completion** (學習報告完成):

    **When**: All tasks completed AND `CONTRACT_LEARNING_MODE = true`

    a. **Finalize learning report**:
       - Add completion timestamp
       - Calculate learning statistics:
         - Total contract tasks completed
         - Concepts covered
         - Security checks passed/warned
         - Estimated learning time

    b. **Generate session summary**:
       ```
       ═══════════════════════════════════════════════════════════════
       📊 學習報告摘要
       ═══════════════════════════════════════════════════════════════

       | 指標 | 數值 |
       |------|------|
       | 完成合約任務 | X |
       | 學習概念數 | Y |
       | 安全檢查通過 | Z |
       | 安全警告 | W |

       ## 已學習概念
       - [概念列表]

       ## 延伸學習建議
       - [推薦資源]

       完整報告位置：FEATURE_DIR/learning/session-[timestamp].md
       ═══════════════════════════════════════════════════════════════
       ```

    c. **Export report** (if `--export-report` flag):
       - Copy session report to project root as `learning-report-[feature]-[date].md`

13. Completion validation:
    - Verify all required tasks are completed
    - Check that implemented features match the original specification
    - Validate that tests pass and coverage meets requirements
    - Confirm the implementation follows the technical plan
    - Report final status with summary of completed work

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/speckit.tasks` first to regenerate the task list.
