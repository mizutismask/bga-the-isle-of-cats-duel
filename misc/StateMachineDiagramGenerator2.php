<?php

declare(strict_types=1);

/**
 * Scan ./modules/php/States for classes extending GameState, extract their IDs, and build a DOT graph
 * including transitions detected via "return SomeState::class" in the same file (supports multiple returns per method).
 *
 * Usage:
 *   php generate_states_dot.php
 *   dot -Tpng stateDiagram.dot -o stateDiagram.png
 */
final class StatesDotGenerator {
    private const STATES_DIR  = __DIR__ . '../modules/php/States';
    private const OUTPUT_FILE = __DIR__ . '/stateDiagram.dot';

    /**
     * Indexed by class FQN.
     * - id: optional numeric id found in const ID
     * - name/type: optional metadata found in const NAME/TYPE
     * - transitions: methodName => list of target class FQN
     *
     * @var array<string, array{id:?int,name:string,type:string,transitions:array<string, list<string>>}>
     */
    private array $statesByClass = [];

    /** @var array<string,int> */
    private array $idByClass = [];

    /**
     * @var array<int, array{name:string,type:string,transitions:array<string, list<int>>}>
     */
    private array $machineStates = [];

    public function run(): void {
        foreach ($this->listPhpFiles(self::STATES_DIR) as $file) {
            $this->parseStateFile($file);
        }

        $this->finalizeIds();
        $this->buildMachineStates();
        $this->writeDot($this->machineStates);
    }

    /**
     * @return list<string>
     */
    private function listPhpFiles(string $dir): array {
        if (!is_dir($dir)) {
            throw new RuntimeException("Directory not found: {$dir}");
        }

        $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
        $files = [];
        foreach ($rii as $f) {
            if ($f->isFile() && strtolower($f->getExtension()) === 'php') {
                $files[] = $f->getPathname();
            }
        }
        sort($files);
        return $files;
    }

    private function parseStateFile(string $file): void {
        $code = file_get_contents($file);
        if ($code === false) {
            return;
        }

        $tokens = token_get_all($code);

        $namespace = '';
        $uses = [];            // alias => \FQN
        $classes = [];         // \ClassFqn => ['extends'=>string,'id'=>?int,'name'=>?string,'type'=>?string,'transitions'=>array<string,list<string>>]
        $currentClassFqn = null;
        $currentFunction = null;

        $braceDepth = 0;
        $inClass = false;

        $i = 0;
        $n = count($tokens);

        while ($i < $n) {
            $t = $tokens[$i];

            if (is_array($t) && $t[0] === T_NAMESPACE) {
                $namespace = $this->readNamespace($tokens, $i);
                $i++;
                continue;
            }

            if (is_array($t) && $t[0] === T_USE && !$inClass) {
                $this->readUseStatements($tokens, $i, $uses);
                $i++;
                continue;
            }

            if ($t === '{') {
                $braceDepth++;
                $i++;
                continue;
            }

            if ($t === '}') {
                $braceDepth--;
                if ($inClass && $braceDepth <= 0) {
                    $inClass = false;
                    $currentClassFqn = null;
                    $currentFunction = null;
                }
                $i++;
                continue;
            }

            if (is_array($t) && $t[0] === T_CLASS) {
                $classInfo = $this->readClassDeclaration($tokens, $i, $namespace, $uses);
                if ($classInfo !== null) {
                    $currentClassFqn = $classInfo['fqn'];
                    $classes[$currentClassFqn] = [
                        'extends' => $classInfo['extends'],
                        'id' => null,
                        'name' => null,
                        'type' => null,
                        'transitions' => [],
                    ];
                    $inClass = true;
                    $braceDepth = 0;
                }
                $i++;
                continue;
            }

            if ($inClass && $currentClassFqn !== null) {
                if (is_array($t) && $t[0] === T_FUNCTION) {
                    $currentFunction = $this->readFunctionName($tokens, $i);
                    $i++;
                    continue;
                }

                if (is_array($t) && $t[0] === T_CONST) {
                    $this->readConstsForStateMetadata($tokens, $i, $classes[$currentClassFqn]);
                    $i++;
                    continue;
                }

                if (is_array($t) && $t[0] === T_RETURN) {
                    $targetFqn = $this->readReturnedClassConst($tokens, $i, $namespace, $uses);
                    if ($targetFqn !== null) {
                        $label = $currentFunction ?? 'return';
                        $classes[$currentClassFqn]['transitions'][$label] ??= [];
                        $classes[$currentClassFqn]['transitions'][$label][] = $targetFqn;
                    }
                    $i++;
                    continue;
                }
            }

            $i++;
        }

        foreach ($classes as $classFqn => $info) {
            if (!$this->isGameStateExtender($info['extends'])) {
                continue;
            }

            $this->statesByClass[$this->normalizeFqn($classFqn)] = [
                'id' => $info['id'],
                'name' => $info['name'] ?? $this->shortName($classFqn),
                'type' => $info['type'] ?? 'activeplayer',
                'transitions' => $this->normalizeTransitions($info['transitions']),
            ];
        }
    }

    /**
     * @param array<string, mixed> $transitions
     * @return array<string, list<string>>
     */
    private function normalizeTransitions(array $transitions): array {
        $out = [];
        foreach ($transitions as $label => $targets) {
            $list = is_array($targets) ? $targets : [$targets];
            $out[(string)$label] = array_values(array_filter(array_map(
                fn($x) => is_string($x) ? $this->normalizeFqn($x) : null,
                $list
            )));
        }
        return $out;
    }

    private function isGameStateExtender(string $extends): bool {
        $base = ltrim($extends, '\\');
        $short = str_contains($base, '\\') ? substr($base, strrpos($base, '\\') + 1) : $base;
        return $short === 'GameState';
    }

    private function shortName(string $fqn): string {
        $fqn = ltrim($fqn, '\\');
        return str_contains($fqn, '\\') ? substr($fqn, strrpos($fqn, '\\') + 1) : $fqn;
    }

    private function normalizeFqn(string $fqn): string {
        return '\\' . ltrim($fqn, '\\');
    }

    private function finalizeIds(): void {
        $nextId = 1;

        foreach ($this->statesByClass as $classFqn => $s) {
            if (is_int($s['id'])) {
                $this->idByClass[$classFqn] = $s['id'];
                $nextId = max($nextId, $s['id'] + 1);
            }
        }

        foreach ($this->statesByClass as $classFqn => $s) {
            if (!isset($this->idByClass[$classFqn])) {
                $this->idByClass[$classFqn] = $nextId++;
            }
        }
    }

    private function buildMachineStates(): void {
        foreach ($this->statesByClass as $classFqn => $s) {
            $id = $this->idByClass[$classFqn];
            $this->machineStates[$id] = [
                'name' => $s['name'],
                'type' => $s['type'],
                'transitions' => [],
            ];
        }

        foreach ($this->statesByClass as $fromClass => $s) {
            $fromId = $this->idByClass[$fromClass];

            foreach (($s['transitions'] ?? []) as $label => $toClasses) {
                $toClasses = is_array($toClasses) ? $toClasses : [$toClasses];

                foreach ($toClasses as $toClass) {
                    if (!is_string($toClass) || $toClass === '') {
                        continue;
                    }
                    $toFqn = $this->normalizeFqn($toClass);
                    if (!isset($this->idByClass[$toFqn])) {
                        continue;
                    }
                    $this->machineStates[$fromId]['transitions'][$label] ??= [];
                    $this->machineStates[$fromId]['transitions'][$label][] = $this->idByClass[$toFqn];
                }
            }
        }

        ksort($this->machineStates);
    }

    /**
     * Write DOT graph to stateDiagram.dot
     *
     * @param array<int, array{name:string,type:string,transitions:array<string, list<int>>}> $machinestates
     */
    private function writeDot(array $machinestates): void {
        $out = "digraph D {\n";

        foreach ($machinestates as $state_id => $state) {
            $color = "red";
            $shape = "ellipse";

            if ($state["name"] === "gameSetup" || $state["name"] === "gameEnd") {
                $shape = "Msquare";
            }
            if ($state["type"] === "game") {
                $color = "orange";
                $shape = "diamond";
            }
            if ($state["type"] === "activeplayer") {
                $color = "blue";
            }
            if ($state["type"] === "multipleactiveplayer") {
                $color = "green";
            }

            $label = $state_id . "_" . $state["name"];
            $out .= "n{$state_id} [label=\"" . $this->escapeDot($label) . "\" color={$color} shape={$shape}];\n";
        }

        foreach ($machinestates as $state_id => $state) {
            foreach (($state["transitions"] ?? []) as $transition_label => $targets) {
                $targets = is_array($targets) ? $targets : [$targets];
                foreach ($targets as $transition) {
                    if (!is_int($transition)) {
                        continue;
                    }
                    $out .= "n{$state_id} -> n{$transition} [label=\"" . $this->escapeDot((string)$transition_label) . "\"];\n";
                }
            }
        }

        $out .= "}\n";

        file_put_contents(self::OUTPUT_FILE, $out);
    }

    private function escapeDot(string $s): string {
        return str_replace(["\\", "\""], ["\\\\", "\\\""], $s);
    }

    /**
     * @param array<int, mixed> $tokens
     */
    private function readNamespace(array $tokens, int &$i): string {
        $i++;
        $parts = [];
        while (isset($tokens[$i])) {
            $t = $tokens[$i];
            if ($t === ';' || $t === '{') {
                break;
            }
            if (is_array($t) && ($t[0] === T_STRING || $t[0] === T_NS_SEPARATOR)) {
                $parts[] = $t[1];
            }
            $i++;
        }
        return implode('', $parts);
    }

    /**
     * @param array<int, mixed> $tokens
     * @param array<string,string> $uses
     */
    private function readUseStatements(array $tokens, int &$i, array &$uses): void {
        $i++;
        $current = '';
        $alias = null;

        while (isset($tokens[$i])) {
            $t = $tokens[$i];

            if ($t === ';') {
                $this->commitUse($current, $alias, $uses);
                break;
            }

            if ($t === ',') {
                $this->commitUse($current, $alias, $uses);
                $current = '';
                $alias = null;
                $i++;
                continue;
            }

            if (is_array($t) && ($t[0] === T_STRING || $t[0] === T_NS_SEPARATOR)) {
                $current .= $t[1];
                $i++;
                continue;
            }

            if (is_array($t) && $t[0] === T_AS) {
                $alias = $this->readNextString($tokens, $i);
                $i++;
                continue;
            }

            $i++;
        }
    }

    /**
     * @param array<string,string> $uses
     */
    private function commitUse(string $current, ?string $alias, array &$uses): void {
        $fqn = $this->normalizeFqn(trim($current));
        if ($fqn === '\\') {
            return;
        }

        $short = $this->shortName($fqn);
        $key = $alias ?: $short;
        $uses[$key] = $fqn;
    }

    /**
     * @param array<int, mixed> $tokens
     * @return array{fqn:string,extends:string}|null
     */
    private function readClassDeclaration(array $tokens, int &$i, string $namespace, array $uses): ?array {
        // Skip anonymous classes: "new class"
        $prev = $this->prevNonWhitespaceToken($tokens, $i);
        if (is_array($prev) && $prev[0] === T_NEW) {
            return null;
        }

        $name = $this->readNextString($tokens, $i);
        if ($name === null) {
            return null;
        }

        $extends = '';
        $j = $i;
        while (isset($tokens[$j]) && $tokens[$j] !== '{') {
            $t = $tokens[$j];
            if (is_array($t) && $t[0] === T_EXTENDS) {
                $extends = $this->readNextName($tokens, $j);
                break;
            }
            $j++;
        }

        $fqn = ($namespace !== '' ? '\\' . $namespace . '\\' : '\\') . $name;
        $extendsResolved = $this->resolveName($extends, $namespace, $uses);

        return ['fqn' => $fqn, 'extends' => $extendsResolved];
    }

    /**
     * @param array<int, mixed> $tokens
     * @param array{extends:string,id:?int,name:?string,type:?string,transitions:array<string,list<string>>} $classInfo
     */
    private function readConstsForStateMetadata(array $tokens, int &$i, array &$classInfo): void {
        $chunk = '';
        $j = $i;

        while (isset($tokens[$j])) {
            $t = $tokens[$j];
            if ($t === ';') {
                break;
            }
            $chunk .= is_array($t) ? $t[1] : $t;
            $j++;
        }

        if ($classInfo['id'] === null && preg_match('/\bID\s*=\s*(\d+)/', $chunk, $m)) {
            $classInfo['id'] = (int)$m[1];
        }
        if ($classInfo['name'] === null && preg_match('/\bNAME\s*=\s*([\'"])(.*?)\1/', $chunk, $m)) {
            $classInfo['name'] = $m[2];
        }
        if ($classInfo['type'] === null && preg_match('/\bTYPE\s*=\s*([\'"])(.*?)\1/', $chunk, $m)) {
            $classInfo['type'] = $m[2];
        }
    }

    /**
     * @param array<int, mixed> $tokens
     */
    private function readFunctionName(array $tokens, int &$i): ?string {
        $j = $i + 1;
        while (isset($tokens[$j])) {
            $t = $tokens[$j];
            if ($t === '(') {
                return null; // closure
            }
            if (is_array($t) && $t[0] === T_STRING) {
                return $t[1];
            }
            $j++;
        }
        return null;
    }

    /**
     * Detect "return SomeState::class" and return resolved FQN of SomeState, or null.
     *
     * @param array<int, mixed> $tokens
     */
    private function readReturnedClassConst(array $tokens, int &$i, string $namespace, array $uses): ?string {
        $j = $i + 1;

        while (isset($tokens[$j]) && is_array($tokens[$j]) && in_array($tokens[$j][0], [T_WHITESPACE, T_COMMENT, T_DOC_COMMENT], true)) {
            $j++;
        }

        $name = '';
        while (isset($tokens[$j])) {
            $t = $tokens[$j];

            if (is_array($t) && ($t[0] === T_STRING || $t[0] === T_NS_SEPARATOR)) {
                $name .= $t[1];
                $j++;
                continue;
            }

            if (is_array($t) && in_array($t[0], [T_NAME_QUALIFIED, T_NAME_FULLY_QUALIFIED], true)) {
                $name .= $t[1];
                $j++;
                continue;
            }

            if (is_array($t) && $t[0] === T_DOUBLE_COLON) {
                break;
            }

            return null;
        }

        if (!isset($tokens[$j]) || !is_array($tokens[$j]) || $tokens[$j][0] !== T_DOUBLE_COLON) {
            return null;
        }

        $j++;
        while (isset($tokens[$j]) && is_array($tokens[$j]) && $tokens[$j][0] === T_WHITESPACE) {
            $j++;
        }

        // Expect "class" constant
        if (!isset($tokens[$j]) || !is_array($tokens[$j]) || $tokens[$j][0] !== T_CLASS) {
            return null;
        }

        if ($name === '') {
            return null;
        }

        return $this->resolveName($name, $namespace, $uses);
    }

    /**
     * @param array<int, mixed> $tokens
     */
    private function readNextString(array $tokens, int &$i): ?string {
        $j = $i + 1;
        while (isset($tokens[$j])) {
            $t = $tokens[$j];
            if (is_array($t) && $t[0] === T_STRING) {
                $i = $j;
                return $t[1];
            }
            if ($t === '{' || $t === ';' || $t === '(') {
                return null;
            }
            $j++;
        }
        return null;
    }

    /**
     * @param array<int, mixed> $tokens
     */
    private function readNextName(array $tokens, int &$i): string {
        $j = $i + 1;
        $name = '';

        while (isset($tokens[$j])) {
            $t = $tokens[$j];
            if (is_array($t) && in_array($t[0], [T_WHITESPACE, T_COMMENT, T_DOC_COMMENT], true)) {
                $j++;
                continue;
            }
            break;
        }

        while (isset($tokens[$j])) {
            $t = $tokens[$j];

            if (is_array($t) && ($t[0] === T_STRING || $t[0] === T_NS_SEPARATOR)) {
                $name .= $t[1];
                $j++;
                continue;
            }

            if (is_array($t) && in_array($t[0], [T_NAME_QUALIFIED, T_NAME_FULLY_QUALIFIED], true)) {
                $name .= $t[1];
                $j++;
                continue;
            }

            break;
        }

        $i = $j;
        return $name;
    }

    private function resolveName(string $name, string $namespace, array $uses): string {
        $name = trim($name);
        if ($name === '') {
            return '';
        }

        if ($name[0] === '\\') {
            return $this->normalizeFqn($name);
        }

        $first = $name;
        $rest = '';
        if (str_contains($name, '\\')) {
            $first = substr($name, 0, (int)strpos($name, '\\'));
            $rest = substr($name, (int)strpos($name, '\\'));
        }

        if (isset($uses[$first])) {
            return $uses[$first] . $rest;
        }

        if ($namespace !== '') {
            return '\\' . $namespace . '\\' . $name;
        }

        return '\\' . $name;
    }

    /**
     * @param array<int, mixed> $tokens
     */
    private function prevNonWhitespaceToken(array $tokens, int $i): mixed {
        for ($j = $i - 1; $j >= 0; $j--) {
            $t = $tokens[$j];
            if (is_array($t) && $t[0] === T_WHITESPACE) {
                continue;
            }
            return $t;
        }
        return null;
    }
}

(new StatesDotGenerator())->run();
